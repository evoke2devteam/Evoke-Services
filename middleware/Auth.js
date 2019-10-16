const jwt = require('jwt-simple');
const moment = require('moment');
const secret = '11+3Ev1v0o3kKke_4';

function createToken(id) {
    const payload = {
        sub: id,
        iat: moment().unix(),
        secret: secret
    }
    return jwt.encode(payload, secret, 'HS256');
}

function isAuth(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(200).send({ status: false, message: 'Se requiere autenticación' });
    }
    const token = req.headers.authorization.split(" ")[1];
    var segments = token.split('.');
    if (segments.length !== 3) {
        return res.status(200).send({ status: false, message: 'El token no es valido' });
    }
    const payload = jwt.decode(token, secret, true, 'HS256');
    if (payload.secret != secret){
        return res.status(200).send({ status: false, message: 'El token no es valido' });
    }
    return next()
}

module.exports = {
    createToken,
    isAuth
};