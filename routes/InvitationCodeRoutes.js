const express = require('express');
const api = express.Router();
const auth = require('../middleware/Auth');
const InvitationController = require('../controllers/InvitationCodeController');
const { celebrate, Joi } = require('celebrate');

api.post('/generate-code', auth.isAuth, InvitationController.generateCode);

api.post('/check-code', auth.isAuth, celebrate({
    body: Joi.object().keys({
        code: Joi.string().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, InvitationController.checkCode);

module.exports = api;