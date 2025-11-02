// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// REGISTER (with image)
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const {
      relation, gender, firstName, lastName, dob, education,
      religion, community, livingIn, state, city, email, phone, password
    } = req.body;

    if (!email || !password || !firstName) return res.status(400).json({ message: 'Missing required fields' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      relation, gender, firstName, lastName,
      dob: dob ? new Date(dob) : undefined,
      education, religion, community, livingIn, state, city,
      email: email.toLowerCase(),
      phone,
      password: hashed,
      profileImage: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await user.save();

    // return minimal user info
    res.status(201).json({ message: 'Registered', user: { id: user._id, firstName: user.firstName, email: user.email, profileImage: user.profileImage } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User doesn't exist. Please sign up." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });

    res.json({ message: 'Login successful', token, user: { id: user._id, firstName: user.firstName, email: user.email, profileImage: user.profileImage } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// FORGOT PASSWORD (send OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Email not registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const subject = 'Pelli.com — Password Reset OTP';
    const text = `Your OTP is ${otp}. It is valid for 10 minutes.`;
    await sendMail(user.email, subject, text, `<p>${text}</p>`);

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Forgot error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// RESET PASSWORD (verify OTP)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetOTP || user.resetOTP !== otp || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all users (for main page)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password -resetOTP -resetOTPExpiry -__v').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error('Users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
