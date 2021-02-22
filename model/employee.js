const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true },
  },
  { versionKey: false }
);

employeeSchema.plugin(uniqueValidator);

employeeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Employee', employeeSchema);
