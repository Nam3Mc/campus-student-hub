const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    date: { type: Date },
    location: { type: String, required: true },
    topic: {  type : String, required: true },
    description: {  type : String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', require: true },
    attendees: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ]
});

sessionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Session', sessionSchema, 'sessions');