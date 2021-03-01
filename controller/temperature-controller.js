require('dotenv').config();
const { validationResult } = require('express-validator');

const Employee = require('../model/employee');
const HttpError = require('../model/http-error');
const Temperature = require('../model/temperature');
const LOG = require('../utils/logger');
const { formattedDate } = require('../utils/time');

const recordTemperature = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { employeeId, temperature } = req.body;

  /* Search for the employee */
  let employee;
  try {
    employee = await Employee.findById(employeeId);
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        'Failed to get the employee information, please try again later',
        500
      )
    );
  }

  if (!employee) {
    return next(
      new HttpError(
        'Employee not found, please check your input information',
        404
      )
    );
  }

  const date = formattedDate();

  let previousRecord;
  try {
    previousRecord = await Temperature.findOneAndUpdate(
      {
        date,
        employee: employeeId,
      },
      { temperature },
      { new: true }
    );
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError('Could not save temperature, please try again later', 500)
    );
  }

  if (previousRecord) {
    return res
      .status(201)
      .json({ message: 'Temperature updated successfully' });
  }

  const newTemperatureRecord = new Temperature({
    date,
    temperature,
    employee: employeeId,
  });

  try {
    await newTemperatureRecord.save();
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError('Could not save temperature, please try again later', 500)
    );
  }

  res.status(201).json({ message: 'Temperature saved successfully' });
};

const getMonthlyTemperature = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { employeeId } = req.employeeData;
  const { time } = req.params;

  let records;
  try {
    records = await Temperature.find(
      {
        date: new RegExp(time),
        employee: employeeId,
      },
      '-employee'
    );
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        'Could not get temperature records, please try again later',
        500
      )
    );
  }

  res.status(200).json({ records });
};

const getTodayTemperature = async (req, res, next) => {
  const { employeeId } = req.employeeData;

  const time = formattedDate();

  let record;
  try {
    record = await Temperature.find(
      {
        date: time,
        employee: employeeId,
      },
      '-employee'
    );
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        'Could not get temperature records, please try again later',
        500
      )
    );
  }

  res.status(200).json({ record });
};

module.exports = {
  recordTemperature,
  getMonthlyTemperature,
  getTodayTemperature,
};
