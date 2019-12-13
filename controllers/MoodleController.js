const request = require('request');

function getCourses(req, res) {
    request.post({
        headers: { 'content-type': 'application/json' },
        url: `https://evoke.moodlecloud.com/webservice/rest/server.php?wstoken=db948bcd784b9b857dc527007526e0e6&moodlewsrestformat=json&wsfunction=mod_choice_get_choices_by_courses&courseids[0]=${req.body.courseid}`,
        json: true
    }, (error, response, body) => {
        if (!error) {
            let arrayOptions = [];
            for (let i = 0; i < body.choices.length; i++) {
                body.choices[i].intro = body.choices[i].intro.replace(/<[^>]*>?/g, '');
                arrayOptions.push(getChoices(body.choices[i].id));
            }
            Promise.all(arrayOptions).then(data => {
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    body.choices[i].options = data[i].options;
                }
                res.status(200).send({ status: true, choices: body.choices });
            }).catch(err => {
                console.log(err)
            });
        } else {
            res.status(response.statusCode).send({ status: false, error });
        }
    });
}

async function listOfStatusUserByCourse(req, res) {
    console.log('ok');
    try {
        let courses = await core_enrol_get_enrolled_users(req.body.id);
        let usersIdArray = [];
        if (courses.length > 0) {
            for (let i = 0; i < courses.length; i++) {
                usersIdArray.push(core_completion_get_activities_completion_status(req.body.id, courses[i].id));
            }
            Promise.all(usersIdArray).then(data => {
                for (let i = 0; i < data.length; i++) {
                    courses[i].statuses = data[i].statuses;
                }
                console.log(courses);
                res.status(200).send({ status: true, data: courses });
            }).catch(err => {
                console.log(err)
            });
        } else {
            res.status(404).send({ status: false, message: 'The course has no enrolled users' })
        }
    } catch (error) {
        res.status(500).send({ status: false, message: '' });
    }
}

function core_completion_get_activities_completion_status(idCurso, idUser) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `https://evoke-colombia.moodle.school/webservice/rest/server.php?wstoken=32764463f86f0ea1cfd1cdf4bb00ac7f&moodlewsrestformat=json&wsfunction=core_completion_get_activities_completion_status&courseid=${idCurso}&userid=${idUser}`,
            json: true
        }, (error, response, body) => {
            if (!error) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}

function core_enrol_get_enrolled_users(id) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `https://evoke-colombia.moodle.school/webservice/rest/server.php?wstoken=32764463f86f0ea1cfd1cdf4bb00ac7f&moodlewsrestformat=json&wsfunction=core_enrol_get_enrolled_users&courseid=${id}`,
            json: true

        }, (error, response, body) => {
            if (!error) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}

function getChoices(id) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `https://evoke.moodlecloud.com/webservice/rest/server.php?wstoken=db948bcd784b9b857dc527007526e0e6&moodlewsrestformat=json&wsfunction=mod_choice_get_choice_options&choiceid=${id}`,
            json: true
        }, (error, response, body) => {
            if (!error) {
                res(body);
            } else {
                rej(error);
            }
        });
    });
}

//listOfStatusUserByCourse()

module.exports = {
    getCourses,
    listOfStatusUserByCourse
}