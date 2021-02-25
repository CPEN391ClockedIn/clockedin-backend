const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/check-auth');

const {
  recordTemperature,
  getMonthlyTemperature,
  getTodayTemperature,
} = require('../controller/temperature-controller');

const temperatureRouter = express.Router();

temperatureRouter.post(
  '/record',
  [check('employeeId').notEmpty(), check('temperature').notEmpty()],
  recordTemperature
);

temperatureRouter.use(checkAuth);

temperatureRouter.get(
  '/monthly/:time',
  [check('time').matches(/^\d{4}-(0[1-9]|1[012])$/)],
  getMonthlyTemperature
);

temperatureRouter.get('/today', getTodayTemperature);

module.exports = temperatureRouter;
