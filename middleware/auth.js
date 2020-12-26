const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) return res.status(401).json({ msg: 'No token, authorisation denied.' });

  try {
    await jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
      if (error) return res.status(401).json({ msg: 'Token is not valid.' });

      req.user = decoded.user;
      next();
    });
  } catch (e) {
    console.error('Something wrong with auth middleware');
    console.error(e.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

