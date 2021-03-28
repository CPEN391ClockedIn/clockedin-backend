const express = require("express");

const { uploadImage } = require("../controller/image-controller");
const fileUpload = require("../middleware/file-upload");

const imageRouter = express.Router();

imageRouter.post(
  "/:employeeId",
  fileUpload.single("employeeImage"),
  uploadImage
);

module.exports = imageRouter;
