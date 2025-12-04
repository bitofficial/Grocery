const sendError = require("../utils/sendError");
const jwt = require("jsonwebtoken");

const isAdminAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, 401, "No token provided");
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );

    // Check if it's an admin token
    if (decoded.role !== "Admin") {
      sendError(res, 403, "Access denied. Admin role required.");
      return;
    }

    // Set admin info in request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log(error.message);
    sendError(res, 401, "Invalid or expired token");
  }
};

module.exports = isAdminAuth;
