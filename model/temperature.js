const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const temperatureSchema = new Schema(
  {
    date: { type: String, required: true },
    temperature: { type: Number, required: true },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
  },
  { versionKey: false }
);

temperatureSchema.plugin(uniqueValidator);

temperatureSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Temperature', temperatureSchema);
