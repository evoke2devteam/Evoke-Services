const express = require('express');
const api = express.Router();
const auth = require('../middleware/Auth');
const EvidenceController = require('../controllers/EvidenceController');
const { celebrate, Joi } = require('celebrate');

api.post('/create-evidence', auth.isAuth, celebrate({
    body: Joi.object().keys({
        id_gg_drive: Joi.string().required(),
        name: Joi.string().required(),
        id_gg: Joi.string().required(),
        id_mission: Joi.string().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, EvidenceController.createEvidence);

api.post('/create-comment', auth.isAuth, celebrate({
    body: Joi.object().keys({
        id_gg: Joi.string().required(),
        message: Joi.string().required(),
        id_gg_drive: Joi.string().required(),
        id_mission: Joi.string().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, EvidenceController.createComment);

api.post('/list-evidences-user', auth.isAuth, celebrate({
    body: Joi.object().keys({
        id_gg: Joi.string().required(),
        id_mission: Joi.string().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, EvidenceController.showEvidences);

module.exports = api;