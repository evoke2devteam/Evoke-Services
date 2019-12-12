const express = require('express');
const api = express.Router();
const auth = require('../middleware/Auth');
const MoodleController = require('../controllers/MoodleController');
const { celebrate, Joi } = require('celebrate');

api.post('/get-courses', auth.isAuth, celebrate({
    body: Joi.object().keys({
        courseid: Joi.number().integer().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, MoodleController.getCourses);


api.post('/get-states-user-activities', auth.isAuth, celebrate({
    body: Joi.object().keys({
        id: Joi.number().integer().required()
    }).unknown()
}), (err, req, res, next) => {
    res.status(400).send({ status: false, message: 'Missing data to send' });
}, MoodleController.listOfStatusUserByCourse);

module.exports = api;