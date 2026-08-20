const jwt = require("jsonwebtoken");

const teacherProtect = (req, res, next) => {
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

    if (decoded.role !== "TEACHER") {
      return res.status(403).json({
        success: false,
        message: "Teacher access required",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      teacherRole: decoded.teacherRole,
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

module.exports = teacherProtect;