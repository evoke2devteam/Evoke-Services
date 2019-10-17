const express = require('express');
const api = express.Router();
const { celebrate, Joi } = require('celebrate');
const UserController = require('../controllers/UsersController');
const google = require('../middleware/AuthGooogle');

api.post('/login', google.authGoogle, celebrate({
    body: Joi.object().keys({
        id_gg: Joi.string().required(),
        firstName: Joi.string().required(),
        email: Joi.string().email().required()
    }).unknown()
}), (err, req, res, next) => {
    if (err.joi.details[0].path[0] == 'email') {
        res.status(400).send({ status: false, message: 'The email is not valid' });
    } else {
        res.status(400).send({ status: false, message: 'Missing data to send' });
    }
}, UserController.login);

module.exports = api;