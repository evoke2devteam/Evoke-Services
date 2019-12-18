const request = require('request');

function getCourses(req, res) {
    request.post({
        headers: { 'content-type': 'application/json' },
        url: `https://evoke-colombia.moodle.school/webservice/rest/server.php?wstoken=db948bcd784b9b857dc527007526e0e6&moodlewsrestformat=json&wsfunction=mod_choice_get_choices_by_courses&courseids[0]=${req.body.courseid}`,
        json: true
    }, (error, response, body) => {
        if (!error) {
            let arrayOptions = [];
            for (let i = 0; i < body.choices.length; i++) {
                body.choices[i].intro = body.choices[i].intro.replace(/<[^>]*>?/g, '');
                arrayOptions.push(getChoices(body.choices[i].id));
            }
            Promise.all(arrayOptions).then(data => {
                //console.log(data);
                for (let i = 0; i < data.length; i++) {
                    body.choices[i].options = data[i].options;
                }
                res.status(200).send({ status: true, choices: body.choices });
            }).catch(err => {
                //console.log(err);
                res.status(500).send({ status: false, error: err });
            });
        } else {
            res.status(response.statusCode).send({ status: false, error });
        }
    });
}

async function listOfStatusUserByCourse(req, res) {
    try {
        let courses = await core_enrol_get_enrolled_users(req.body.id);
        let activities = await core_course_get_contents(req.body.id);
        let usersIdArray = [];
        let userPaidArray = [];
        console.log(activities);
        if (courses.length > 0 && activities.length > 0) {
            let activitiesInfo = [];
            for (let i = 0; i < activities.length; i++) {
                for (let j = 0; j < activities[i].modules.length; j++) {
                    activitiesInfo.push({
                        id: activities[i].modules[j].id,
                        name: activities[i].modules[j].name
                    });
                }
            }
            for (let i = 0; i < courses.length; i++) {
                usersIdArray.push(core_completion_get_activities_completion_status(req.body.id, courses[i].id));
            }
            let activitiesIsArray = [];
            Promise.all(usersIdArray).then(data => {
                for (let i = 0; i < courses.length; i++) {
                    for (let j = 0; j < data[0].statuses.length; j++) {
                        //console.log('User: ' + courses[i].id + ' /n Activity: ' + data[0].statuses[j].cmid); 
                        userPaidArray.push(getMissionPaid(data[0].statuses[j].cmid, courses[i].id));
                    }
                }
                for (let i = 0; i < data[0].statuses.length; i++) {
                    //console.log(data[0].statuses[i].cmid);
                    activitiesIsArray.push(get_mission_score_reward(data[0].statuses[i].cmid, 1));
                }
                Promise.all(userPaidArray).then(paid => { 
                    //console.log(paid);
                    Promise.all(activitiesIsArray).then(data2 => {
                        for (let i = 0; i < data.length; i++) {
                            courses[i].statuses = data[i].statuses;
                        }
                        let iter = 0
                        for (let i = 0; i < courses.length; i++) {
                            for (let j = 0; j < courses[i].statuses.length; j++) {
                                //const element = array[j];
                                name = activitiesInfo.map(e => { return e.name }).indexOf(courses[i].statuses[j].cmid);
                                console.log(name);
                                courses[i].statuses[j].reward = data2[j].Reward;
                                courses[i].statuses[j].paid_status = paid[iter].paid_status;
                                iter ++;
                            }
    
                        }
                        res.status(200).send({ status: true, data: courses });
                    }).catch(err2 => {
                        console.log(err2)
                        res.status(500).send({ status: false, error: err });
                    });
                }).catch(errPaid => { 
                    console.log(errPaid)
                    res.status(500).send({ status: false, error: errPaid });
                });
            }).catch(err => {
                console.log(err)
                res.status(500).send({ status: false, error: err });
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

function get_mission_score_reward(mission, score) {
    return new Promise((res, rej) => {
        request.get({
            headers: { 'content-type': 'application/json' },
            url: 'http://172.18.0.22:3001/evocoin/get_mission_score_reward',
            json: {
                mission_id: mission,
                score: score
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                res(body);
            } else {
                rej(body);
            }
        });
    });
}

function core_course_get_contents(course_id){
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json' },
            url: `https://evoke-colombia.moodle.school/webservice/rest/server.php?wstoken=32764463f86f0ea1cfd1cdf4bb00ac7f&moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=    ${course_id}`,
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

function getMissionPaid(mission, user) {
    return new Promise((res, rej) => {
        request.post({
            headers: { 'content-type': 'application/json',
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0IiwiaWF0IjoxNTcyMzg2OTc0LCJzZWNyZXQiOiIxMSszRXYxdjBvM2tLa2VfNCJ9.jkTrhT-KoTjU9iITyPJlxBLovfBDEPVDLgJU5PhF2HY' 
        },
            url: 'https://www.evokecolombia.com/mission/get-paid',
            json: {
                mission_id: mission,
                user: user
            }
        }, (error, response, body) => {
            //console.log(body);
            if (!error && response.statusCode == 200) {
                //console.log(1);
                res(body);
            } else if (!error && response.statusCode == 404) {
                //console.log(0);
                res(body);
            } else {
                rej(body);
            }
        });
    });
}

//listOfStatusUserByCourse()

module.exports = {
    getCourses,
    listOfStatusUserByCourse
}