const express = require('express');
const { check } = require('express-validator');

const {
  clockIn,
  clockOut,
  getMonthlyHistory,
} = require('../controller/history-controller');
const checkAuth = require('../middleware/check-auth');

const historyRouter = express.Router();

historyRouter.use(checkAuth);

historyRouter.post('/clockinmanual', clockIn);

historyRouter.post('/clockout', clockOut);

historyRouter.get(
  '/monthly',
  [check('time').matches(/^\d{4}-(0[1-9]|1[012])$/)],
  getMonthlyHistory
);

module.exports = historyRouter;
