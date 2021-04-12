require("dotenv").config();
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

const HttpError = require("../model/http-error");
const LOG = require("../utils/logger");

AWS.config.loadFromPath(path.join("config.json"));
const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const uploadImage = async (req, res, next) => {
  const { employeeId } = req.params;
  const employeeImage = req.file;

  const uploadParams = {
    Bucket: "clockedin",
    Key: employeeImage.originalname,
    Body: employeeImage.buffer,
  };

  const faceParams = {
    CollectionId: "clockedin",
    Image: {
      S3Object: {
        Bucket: "clockedin",
        Name: employeeImage.originalname,
      },
    },
    ExternalImageId: employeeId,
    MaxFaces: "1",
    QualityFilter: "AUTO",
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      LOG.error(req._id, err.message);
      return next(
        new HttpError(
          "Could not upload your image, please try again later",
          500
        )
      );
    }
    if (data) {
      rekognition.indexFaces(faceParams, (err, data) => {
        if (err) {
          return next(
            new HttpError(
              "Could not upload your image, please try again later",
              500
            )
          );
        }
        if (data) {
          res.status(201).json({ message: "Image uploaded successfully" });
        }
      });
    }
  });
};

/* Testing Purpose Only */
const imageTest = async (req, res, next) => {
  const { part, testImageString, end } = req.body;

  console.log(part, testImageString, end);

  fs.writeFileSync(`imagePart${part}.txt`, testImageString);

  if (end) {
    fs.writeFileSync(`image.txt`, "");

    let index = 1;

    while (fs.existsSync(`imagePart${index}.txt`)) {
      const text = fs.readFileSync(`imagePart${index}.txt`).toString("utf-8");
      fs.appendFileSync("image.txt", text);

      index++;
    }
  }

  if (!part || !testImageString) {
    return next(new HttpError("Uploading failed, please try again", 400));
  }

  res.status(201).json({ message: "Image uploaded successfully" });
};

module.exports = {
  uploadImage,
  imageTest,
};
