const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!["TEACHER", "PARENT"].includes(decoded.role)) {
      return next(new Error("Chat access denied"));
    }

    socket.user = {
      id: decoded.id,
      role: decoded.role,
      teacherRole: decoded.teacherRole || null,
      franchiseId: decoded.franchiseId,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};

module.exports = socketAuth;