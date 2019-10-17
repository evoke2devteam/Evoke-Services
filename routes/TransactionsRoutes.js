const express = require('express');
const api = express.Router();
const auth = require('../middleware/Auth');
const TransactionController = require('../controllers/TransactionsController');
const { celebrate, Joi } = require('celebrate');

api.post('/approve-transaction', auth.isAuth, celebrate({
    body: Joi.object().keys({
        addressfrom: Joi.string().required(),
        //privatekey: Joi.string().required(),
        addressto: Joi.string().required(),
        amount: Joi.string().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, TransactionController.approveTransaction);

api.post('/balance-of', auth.isAuth, celebrate({
    body: Joi.object().keys({
        id: Joi.string().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, TransactionController.balanceOf);

module.exports = api;