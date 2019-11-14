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

module.exports = {
    getCourses
}