const express = require("express");

const { uploadImage, imageTest } = require("../controller/image-controller");
const fileUpload = require("../middleware/file-upload");

const imageRouter = express.Router();

// imageRouter.post("/test", fileUpload.single("testImage"), imageTest);
imageRouter.post("/test", imageTest);

imageRouter.post(
  "/:employeeId",
  fileUpload.single("employeeImage"),
  uploadImage
);

module.exports = imageRouter;
