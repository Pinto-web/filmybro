const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    try {
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ error: 'User deleted or not found' });
      }
      next();
    } catch (dbError) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
