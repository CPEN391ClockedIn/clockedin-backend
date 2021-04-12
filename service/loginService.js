const History = require("../model/history");
const Temperature = require("../model/temperature");
const { formattedDate, formattedTime } = require("../utils/time");

const handleAutoLogin = async (employeeId) => {
  const date = formattedDate();

  /* Check if the employee has clocked in */
  let clockInRecord;
  try {
    clockInRecord = await History.findOne({
      date,
      employee: employeeId,
    });
  } catch (err) {
    return {
      code: 500,
      message: "Could not save clock in information, please try again later",
    };
  }

  if (clockInRecord) {
    return {
      code: 403,
      message: "Could not clock in twice on the same day!",
    };
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
    return {
      code: 500,
      message: "Could not save clock in information, please try again later",
    };
  }

  return {
    code: 201,
    message: "Clocked in successfully",
  };
};

const handleAutoLoginHardware = async (employeeId, temperature) => {
  const date = formattedDate();

  /* Check if the employee has clocked in */
  let clockInRecord;
  try {
    clockInRecord = await History.findOne({
      date,
      employee: employeeId,
    });
  } catch (err) {
    return {
      code: 500,
      message: "Could not save clock in information, please try again later",
    };
  }

  if (clockInRecord) {
    return {
      code: 403,
      message: "Could not clock in twice on the same day!",
    };
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
    return {
      code: 500,
      message: "Could not save clock in information, please try again later",
    };
  }

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
    return {
      code: 500,
      message: "Could not not save temperature, please try again later",
    };
  }

  if (previousRecord) {
    return {
      code: 201,
      message: "Clocked in successfully and your body temperature has updated",
    };
  }

  const newTemperatureRecord = new Temperature({
    date,
    temperature,
    employee: employeeId,
  });

  try {
    await newTemperatureRecord.save();
  } catch (err) {
    return {
      code: 500,
      message: "Could not not save temperature, please try again later",
    };
  }

  return {
    code: 201,
    message: "Clocked in successfully and your body temperature has saved",
  };
};

module.exports = {
  handleAutoLogin,
  handleAutoLoginHardware,
};
