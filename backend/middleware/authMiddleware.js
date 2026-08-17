const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("J WT DECODED:", decoded);

    if (decoded.role !== "SYSTEM_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Attach authenticated admin to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Keep user reference too
    req.user = req.admin;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = protect;