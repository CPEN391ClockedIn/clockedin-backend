const express = require('express');
const { check } = require('express-validator');

const {
  signup,
  login,
  getProfile,
} = require('../controller/employee-controller');
const checkAuth = require('../middleware/check-auth');

const employeeRouter = express.Router();

employeeRouter.post(
  '/signup',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
    check('name').not().isEmpty(),
  ],
  signup
);

employeeRouter.post('/login', login);

employeeRouter.use(checkAuth);

employeeRouter.get('/me', getProfile);

module.exports = employeeRouter;
