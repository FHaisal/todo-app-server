const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    await res.json(user);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server error');
  }
});

router.post(
  '/register',
  [
    check('email', 'Please include a valid email!').toLowerCase().isEmail(),
    check('password', 'Enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) return res.status(400).json({ errors: [{
          value: email,
          msg: 'User already exists!',
          param: 'email',
          location: 'body'
        }]});

      user = new User({
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (e, token) => {
          if (e) throw e;
          res.json({ token });
        }
      );
    } catch (e) {
      console.error(e.message);
      res.status(500).send('Server error');
    }
  }
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email!').toLowerCase().isEmail(),
    check('password', 'Password is required').exists({ checkFalsy: true, checkNull: true }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) return res.status(400).json({ errors: [{
          value: email,
          msg: 'Invalid email!',
          param: 'email',
          location: 'body'
        }]});

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(400).json({ errors: [{
          msg: 'Password incorrect',
          param: 'password',
          location: 'body'
        }] });

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (e, token) => {
          if (e) throw e;
          res.json({ token });
        }
      );
    } catch (e) {
      console.error(e.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;