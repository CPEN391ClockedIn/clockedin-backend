const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const historySchema = new Schema(
  {
    date: { type: String, required: true },
    clockInTime: { type: String, required: true },
    clockOutTime: { type: String },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
  },
  { versionKey: false }
);

historySchema.plugin(uniqueValidator);

historySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('History', historySchema);
