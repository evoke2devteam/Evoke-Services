const express = require('express');
const api = express.Router();
const auth = require('../middleware/Auth');
const MoodleController = require('../controllers/MoodleController');
const { celebrate, Joi } = require('celebrate');

api.post('get-categories', auth.isAuth, MoodleController.getCategories);

module.exports = api;