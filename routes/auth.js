const express = require('express');
const router = express.Router();
const { User } = require('../models');

// GET Login Page
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { error: null, success: null });
});

// POST Login Form
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.render('auth/login', { error: 'Please enter both username and password.', success: null });
    }

    let user = await User.findOne({ where: { username: username.toLowerCase().trim() } });
    
    // If user not found by username, check if a teacher has this phone number or student has this admission number
    if (!user) {
      const { Teacher, Student } = require('../models');
      const teacher = await Teacher.findOne({ where: { phone: username.trim() } });
      if (teacher) {
        user = await User.findOne({ where: { role: 'teacher', referenceId: teacher.id } });
      } else {
        const student = await Student.findOne({ where: { admissionNumber: username.trim() } });
        if (student) {
          user = await User.findOne({ where: { role: 'parent', referenceId: student.id } });
        }
      }
    }

    if (!user) {
      return res.render('auth/login', { error: 'Invalid username/phone or password.', success: null });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', { error: 'Invalid username/phone or password.', success: null });
    }

    // Set Session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;
    req.session.referenceId = user.referenceId;

    if (user.role === 'teacher') {
      return res.redirect('/teacher/select-class');
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { error: 'An internal server error occurred. Please try again.', success: null });
  }
});

// GET Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;
