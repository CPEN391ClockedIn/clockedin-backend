require("dotenv").config();
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const Employee = require("../model/employee");
const HttpError = require("../model/http-error");
const LOG = require("../utils/logger");

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { email, password, name } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError("Could not create employee, please try again later", 500)
    );
  }

  const newEmployee = new Employee({
    email,
    password: hashedPassword,
    name,
  });

  try {
    await newEmployee.save();
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError("Employee exists already, please login instead", 422)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { employeeId: newEmployee.id, email: newEmployee.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRE_TIME }
    );
  } catch {
    return next(
      new HttpError("Signing Up failed, please try again later", 500)
    );
  }

  res
    .status(201)
    .json({ employeeId: newEmployee.id, email: newEmployee.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }

  let existingEmployee;
  try {
    existingEmployee = await Employee.findOne({ email });
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError("Logging in failed, please try again later", 500)
    );
  }

  if (!existingEmployee) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingEmployee.password);
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        "Could not log you in, please check your credentials and try again",
        500
      )
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { employeeId: existingEmployee.id, email: existingEmployee.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch {
    return next(new HttpError("Logging Up failed, please try again", 500));
  }

  res.json({
    employeeId: existingEmployee.id,
    email: existingEmployee.email,
    token,
  });
};

const getProfile = async (req, res, next) => {
  const { employeeId } = req.employeeData;

  let employee;
  try {
    employee = await Employee.findById(employeeId, "-password");
  } catch (err) {
    LOG.error(req._id, err.message);
    return next(
      new HttpError(
        "Failed to get the profile information, please try again later",
        500
      )
    );
  }

  res.status(200).json(employee);
};

module.exports = {
  signup,
  login,
  getProfile,
};
