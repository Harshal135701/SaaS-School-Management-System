const jwt = require("jsonwebtoken");

const chatProtect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!["PARENT", "TEACHER"].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Chat access required",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      teacherRole: decoded.teacherRole || null,
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

module.exports = chatProtect;