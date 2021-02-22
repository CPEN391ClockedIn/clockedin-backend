require('dotenv').config();

const Employee = require('../model/employee');
const HttpError = require('../model/http-error');
const Temperature = require('../model/temperature');
const LOG = require('../utils/logger');
const { formattedDate } = require('../utils/time');

const recordTemperature = async (req, res, next) => {
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

  if (!!previousRecord) {
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

module.exports = {
  recordTemperature,
};
