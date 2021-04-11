require("dotenv").config();
const multer = require("multer");

const fileUpload = multer({
  limits: parseInt(process.env.MAX_FILE_SIZE),
});

module.exports = fileUpload;
