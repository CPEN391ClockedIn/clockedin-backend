const express = require('express');

const { clockIn, clockOut } = require('../controller/history-controller');
const checkAuth = require('../middleware/check-auth');

const historyRouter = express.Router();

historyRouter.use(checkAuth);

historyRouter.post('/clockinmanual', clockIn);

historyRouter.post('/clockout', clockOut);

module.exports = historyRouter;
