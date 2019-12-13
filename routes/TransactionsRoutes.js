const express = require('express');
const api = express.Router();
const auth = require('../middleware/Auth');
const TransactionController = require('../controllers/TransactionsController');
const { celebrate, Joi } = require('celebrate');

api.post('/approve_transaction', auth.isAuth, celebrate({
    body: Joi.object().keys({
        addressfrom: Joi.string().required(),
        //privatekey: Joi.string().required(),
        addressto: Joi.string().required(),
        amount: Joi.string().required(),
        type: Joi.string().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, TransactionController.approveTransaction);

api.post('/balance-of', auth.isAuth, celebrate({
    body: Joi.object().keys({
        id_moodle: Joi.string().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, TransactionController.balanceOf);

api.post('/get-mission-score', auth.isAuth, celebrate({
    body: Joi.object().keys({
        mission_id: Joi.number().integer().required(),
        score: Joi.number().integer().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, TransactionController.getMissionScore);

api.post('/get-mission-paid', auth.isAuth, TransactionController.getMissionPaid);

api.post('/set-mission-score', auth.isAuth, celebrate({
    body: Joi.object().keys({
        mission_id: Joi.number().integer().required(),
        score: Joi.number().integer().required(),
        reward: Joi.number().integer().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, TransactionController.setMissionScore);

api.post('/pay-mission-score', auth.isAuth, TransactionController.payMissionScore);


module.exports = api;