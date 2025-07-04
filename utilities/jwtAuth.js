const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).render("errors/error401", {
      title: "Unauthorized",
      message: "You must be logged in to view this page."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.jwt = decoded; // Store decoded data (id, email, type, etc.)
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).render("errors/error403", {
      title: "Forbidden",
      message: "Your session has expired or is invalid."
    });
  }
}

module.exports = verifyJWT;
