const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { validateRegister, validateLogin, handleValidationErrors } = require('./middleware/validation');

dotenv.config();

const app = express();


// Rate Limiting

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: { error: 'Too many login/register attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});


// Middleware

app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());


// User Model

const User = require('./models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});


// Google OAuth Strategy

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (googleEnabled) {
  console.log('✅ Google OAuth enabled');
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found from Google'));
      }

      let user = await User.findOne({ 
        $or: [{ googleId: profile.id }, { email: email }] 
      });
      
      if (user) {
        user.googleId = profile.id;
        user.name = profile.displayName;
        user.avatar = profile.photos?.[0]?.value;
        user.lastLogin = new Date();
        await user.save();
      } else {
        user = await User.create({
          googleId: profile.id,
          email: email,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          lastLogin: new Date()
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
} else {
  console.log('⚠️ Google OAuth disabled');
}


// Test Route

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});


// Auth Routes

const authController = require('./controllers/authController');
const { authenticate } = require('./middleware/auth');

app.post('/api/auth/register', authLimiter, validateRegister, handleValidationErrors, authController.register);
app.post('/api/auth/login', authLimiter, validateLogin, handleValidationErrors, authController.login);

if (googleEnabled) {
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: true }),
    (req, res) => {
      const token = jwt.sign(
        { userId: req.user.id }, 
        process.env.JWT_SECRET || 'my_super_secret_key_change_me',
        { expiresIn: '7d' }
      );
      res.redirect(`http://localhost:5000?token=${token}`);
    }
  );
}

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Note Routes

const noteRoutes = require('./routes/noteRoutes');
app.use('/api/notes', apiLimiter, noteRoutes);


// Database Connection

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));


// Start Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (googleEnabled) {
    console.log(`Google OAuth: http://localhost:${PORT}/api/auth/google`);
  }
});

module.exports = app;
