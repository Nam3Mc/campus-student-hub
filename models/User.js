const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true, unique: true }, // ← add this
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // ← make optional for OAuth
  role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
  major: { type: String, required: true, default: 'Undeclared' },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save — skip if there is no password (OAuth users)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema, 'users');