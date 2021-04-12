require("dotenv").config();
const AWS = require("aws-sdk");
const { validationResult } = require("express-validator");
const fs = require("fs");
const { nanoid } = require("nanoid");
const path = require("path");

const History = require("../model/history");
const HttpError = require("../model/http-error");
const {
  handleAutoLogin,
  handleAutoLoginTesting,
} = require("../service/loginService");
const LOG = require("../utils/logger");
const { formattedDate, formattedTime } = require("../utils/time");

AWS.config.loadFromPath(path.join("config.json"));
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

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
        "Could not save clock in information, please try again later",
        500
      )
    );
  }

  if (clockInRecord) {
    return next(
      new HttpError("Could not clock in twice on the same day!", 403)
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
        "Could not save clock in information, please try again later",
        500
      )
    );
  }

  res.status(201).json({ message: "Clocked in successfully" });
};

const clockOut = async (req, res, next) => {
  const { employeeId } = req.employeeData;

  const date = formattedDate();
  const clockOutTime = formattedTime();

  let history;
  try {
    history = await History.findOneAndUpdate(
      { date, employee: employeeId },
      { clockOutTime },
      { new: true }
    );
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        "Could not save clock out information, please try again later",
        500
      )
    );
  }

  if (!history) {
    return next(
      new HttpError("Clock out before clock in is not permitted!", 400)
    );
  }

  res.status(201).json({ message: "Clocked out successfully" });
};

const autoClockIn = async (req, res, next) => {
  const { part, imageString } = req.body;

  if (!part || !imageString) {
    return next(
      new HttpError("Incorrect image formatting, please double check", "400")
    );
  }

  fs.writeFileSync(`imagePart${part}.txt`, imageString);

  if (
    fs.existsSync(`imagePart1.txt`) &&
    fs.existsSync(`imagePart2.txt`) &&
    fs.existsSync(`imagePart3.txt`)
  ) {
    fs.writeFileSync(`image.txt`, "");

    let index = 1;

    while (index <= 3) {
      const text = fs.readFileSync(`imagePart${index}.txt`).toString("utf-8");
      fs.appendFileSync("image.txt", text);

      index++;
    }

    const filename = nanoid(parseInt(process.env.FILENAME_SIZE)) + ".jpg";

    const uploadParams = {
      Bucket: "clockedin",
      Key: filename,
      Body: Buffer.from(fs.readFileSync(`image.txt`).toString(), "base64"),
    };

    const faceParams = {
      CollectionId: "clockedin",
      FaceMatchThreshold: 95,
      Image: {
        S3Object: {
          Bucket: "clockedin",
          Name: filename,
        },
      },
      MaxFaces: 1,
      QualityFilter: "AUTO",
    };

    s3.upload(uploadParams, (err, data) => {
      if (fs.existsSync(`imagePart1.txt`)) {
        fs.unlinkSync(`imagePart1.txt`);
      }
      if (fs.existsSync(`imagePart2.txt`)) {
        fs.unlinkSync(`imagePart2.txt`);
      }
      if (fs.existsSync(`imagePart3.txt`)) {
        fs.unlinkSync(`imagePart3.txt`);
      }

      if (err) {
        LOG.error(req._id, err.message);
        return next(
          new HttpError("Could not log you in, please try again later", 500)
        );
      }
      if (data) {
        rekognition.searchFacesByImage(faceParams, (err, data) => {
          if (err) {
            return next(
              new HttpError("Could not log you in, please try again later", 500)
            );
          }
          if (data) {
            const employeeId = data.FaceMatches[0].Face.ExternalImageId;
            handleAutoLogin(employeeId).then((data) => {
              const { code, message } = data;
              if (code === 201) {
                // return res.status(code).json({ message });
                return res.status(201).json({ success: "true" });
              } else {
                // return next(new HttpError(message, code));
                return res.status(403).json({ success: "false" });
              }
            });
          }
        });
      }
    });
  } else {
    return res.status(201).json({ success: "image success" });
  }
};

const autoClockInTesting = async (req, res, next) => {
  const loginImage = req.file;
  const { temperature } = req.body;

  if (parseInt(temperature) > parseInt(process.env.TEMPERATURE_THRESHOLD)) {
    return next(
      new HttpError(
        "Your body temperature is higher than the company's safe temperature. Please contact your manager!",
        400
      )
    );
  }

  const uploadParams = {
    Bucket: "clockedin",
    Key: loginImage.originalname,
    Body: loginImage.buffer,
  };

  const faceParams = {
    CollectionId: "clockedin",
    FaceMatchThreshold: 95,
    Image: {
      S3Object: {
        Bucket: "clockedin",
        Name: loginImage.originalname,
      },
    },
    MaxFaces: 1,
    QualityFilter: "AUTO",
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      LOG.error(req._id, err.message);
      return next(
        new HttpError("Could not log you in, please try again later", 500)
      );
    }
    if (data) {
      rekognition.searchFacesByImage(faceParams, (err, data) => {
        if (err) {
          return next(
            new HttpError("Could not log you in, please try again later", 500)
          );
        }
        if (data) {
          const employeeId = data.FaceMatches[0].Face.ExternalImageId;
          handleAutoLoginTesting(employeeId, temperature).then((data) => {
            const { code, message } = data;
            if (code === 201) {
              return res.status(code).json({ message });
            } else {
              return next(new HttpError(message, code));
            }
          });
        }
      });
    }
  });
};

const getMonthlyHistory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { employeeId } = req.employeeData;
  const { time } = req.params;

  let records;
  try {
    records = await History.find(
      {
        date: new RegExp(time),
        employee: employeeId,
      },
      "-employee"
    );
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError("Could not get history, please try again later", 500)
    );
  }

  res.status(200).json({ records });
};

const getDailyHistory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { employeeId } = req.employeeData;
  const { time } = req.params;

  let record;
  try {
    record = await History.find(
      {
        date: time,
        employee: employeeId,
      },
      "-employee"
    );
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError("Could not get history, please try again later", 500)
    );
  }

  res.status(200).json({ record });
};

module.exports = {
  clockIn,
  clockOut,
  autoClockIn,
  autoClockInTesting,
  getMonthlyHistory,
  getDailyHistory,
};
