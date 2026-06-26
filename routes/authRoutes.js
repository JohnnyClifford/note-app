require('dotenv').config();
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');

console.log('🔵 authRoutes.js loaded');
console.log('🔵 GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('🔵 GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);


// TEST ROUTE - To verify the file is loading

router.get('/test', (req, res) => {
  console.log('🔵 /test route hit');
  res.json({ 
    message: 'Auth routes file is loaded!',
    googleEnabled: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? true : false
  });
});


// Local Auth Routes (Email/Password) 

console.log('🔵 Registering local routes...');
router.post('/register', authController.register);
router.post('/login', authController.login);
console.log('🔵 Local routes registered');


// Google Oauth Routes

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
console.log(`🔵 googleEnabled = ${googleEnabled}`);

if (googleEnabled) {
  console.log('🔵 Registering Google routes...');
  
  router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  }));
  console.log('🔵 GET /google registered');
  
  router.get('/google/callback', 
    passport.authenticate('google', { 
      failureRedirect: '/login',
      session: true
    }),
    (req, res) => {
      console.log('🔵 Google callback hit');
      const token = jwt.sign(
        { userId: req.user.id }, 
        process.env.JWT_SECRET || 'my_super_secret_key_change_me',
        { expiresIn: '7d' }
      );
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendUrl}?token=${token}`);
    }
  );
  console.log('🔵 GET /google/callback registered');
  
} else {
  console.log('🔵 Google OAuth is disabled');
  
  router.get('/google', (req, res) => {
    console.log('🔵 /google route hit (disabled)');
    res.status(501).json({ error: 'Google OAuth is not configured.' });
  });
  
  router.get('/google/callback', (req, res) => {
    res.status(501).json({ error: 'Google OAuth is not configured' });
  });
}


// Get Current User 

const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, async (req, res) => {
  try {
    const User = require('../models/user');
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

console.log('🔵 All auth routes registered!');
console.log('🔵 Routes on this router:', router.stack.map(l => l.route?.path).filter(Boolean));

module.exports = router;
