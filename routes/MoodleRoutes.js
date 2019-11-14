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

module.exports = api;