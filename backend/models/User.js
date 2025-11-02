// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  relation: String,
  gender: String,
  firstName: { type: String, required: true },
  lastName: String,
  dob: Date,
  education: String,
  religion: String,
  community: String,
  livingIn: String,
  state: String,
  city: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  profileImage: String, // url to /uploads/filename
  resetOTP: String,
  resetOTPExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
