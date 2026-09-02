const jwt = require("jsonwebtoken");

const STAFF_ROLES = [
  "TEACHER",
  "HOD",
  "PRINCIPAL",
  "ACCOUNTANT",
  "DATA_ENTRY",
  "SUPPORT",
];

const teacherOrFranchiseProtect = (req, res, next) => {
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

    if (
      !STAFF_ROLES.includes(decoded.role) &&
      decoded.role !== "FRANCHISE_ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      staffType: decoded.staffType,
      franchiseId: decoded.franchiseId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = teacherOrFranchiseProtect;