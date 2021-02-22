require('dotenv').config();
const jwt = require('jsonwebtoken');

const HttpError = require('../model/http-error');
const LOG = require('../utils/logger');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.employeeData = { employeeId: decodedToken.employeeId };
    next();
  } catch (err) {
    LOG.error(req._id, err.message);
    const error = new HttpError('Authentication failed!', 401);
    return next(error);
  }
};
