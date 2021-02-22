require('dotenv').config();

const Employee = require('../model/employee');
const History = require('../model/history');
const HttpError = require('../model/http-error');
const LOG = require('../utils/logger');
const { formattedDate, formattedTime } = require('../utils/time');

const clockIn = async (req, res, next) => {
  const { employeeId } = req.employeeData;

  const date = formattedDate();

  /* Check if the employee has clocked in */
  let clockInRecord;
  try {
    clockInRecord = await History.findOne({
      date,
      employee: employeeId,
    });
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        'Could not save clock in information, please try again later',
        500
      )
    );
  }

  if (!!clockInRecord) {
    return next(
      new HttpError('Could not clock in twice on the same day!', 403)
    );
  }

  const clockInTime = formattedTime();

  const newClockInRecord = new History({
    date,
    clockInTime,
    employee: employeeId,
  });

  try {
    await newClockInRecord.save();
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        'Could not save clock in information, please try again later',
        500
      )
    );
  }

  res.status(201).json({ message: 'Clocked in successfully' });
};

const clockOut = async (req, res, next) => {
  const { employeeId } = req.employeeData;

  const date = formattedDate();
  const clockOutTime = formattedTime();

  try {
    await History.findOneAndUpdate(
      { date, employee: employeeId },
      { clockOutTime },
      { new: true }
    );
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        'Could not save clock out information, please try again later',
        500
      )
    );
  }

  res.status(201).json({ message: 'Clocked out successfully' });
};

const autoClockIn = (req, res, next) => {
  // TODO
};

module.exports = {
  clockIn,
  clockOut,
  autoClockIn,
};
