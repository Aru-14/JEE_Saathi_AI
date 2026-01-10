const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = function(req, res, next) {
  // 1. Get token from header
  // It handles both "x-auth-token" (common convention) and "Authorization: Bearer <token>"
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // Decode the token using your secret key (stored in .env)
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("✅ Token decoded:", decoded); // Debug Log
    
    // Attach the user payload (e.g., { id: '123' }) to the request object
    // This allows you to use `req.user.id` in your routes
    req.user = decoded;
    console.log("User ID from token:", req.user.id);
    // Move to the next middleware or route handler
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

