const request = require('request');

function getCategories(req, res){
    request.post({
        headers: { 'content-type': 'application/json' },
        url: `https://evoke.moodlecloud.com/webservice/rest/server.php?wstoken=db948bcd784b9b857dc527007526e0e6&moodlewsrestformat=json&wsfunction=core_course_get_categories`,
        json: true
    }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            res.status(200).send({ status: true, body });
        } else {
            res.status(response.statusCode).send({ status: false, error });
        }
    });
}

module.exports = {
    getCategories
}