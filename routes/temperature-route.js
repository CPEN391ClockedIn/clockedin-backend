const express = require('express');

const { recordTemperature } = require('../controller/temperature-controller');

const temperatureRouter = express.Router();

temperatureRouter.post('/record', recordTemperature);

module.exports = temperatureRouter;
