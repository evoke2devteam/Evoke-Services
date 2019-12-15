const express = require('express');
const api = express.Router();
const { celebrate, Joi } = require('celebrate');
const UserController = require('../controllers/UsersController');
const google = require('../middleware/AuthGooogle');

api.post('/login', celebrate({
    body: Joi.object().keys({
        id_moodle: Joi.number().integer().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, UserController.login);

module.exports = api;