const { google } = require('googleapis');


function authGoogle(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({ status: false, message: 'Authentication is required' });
    }
    const foo = new google.auth.OAuth2();
    const token = req.headers.authorization.split(" ")[1];
    foo.verifyIdToken({ idToken: token }).then((res) => {
        return next();
    }).catch((err) => {
        console.log(err);
        return res.status(401).send({ status: false, message: 'Authentication failed' });
    });
}

module.exports = {
    authGoogle
};