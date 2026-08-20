const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Teacher, Franchise } = require("../models");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const teacher = await Teacher.findOne({
      where: { email },
      include: [
        {
          model: Franchise,
          as: "franchise",
          attributes: ["id", "name", "code", "status"],
        },
      ],
    });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!teacher.password) {
      return res.status(403).json({
        success: false,
        message: "Teacher account has no password configured",
      });
    }

    if (teacher.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Teacher account is inactive",
      });
    }

    if (!teacher.franchise || teacher.franchise.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Franchise is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      teacher.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: teacher.id,
        email: teacher.email,
        role: "TEACHER",
        teacherRole: teacher.role,
        franchiseId: teacher.franchiseId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: "TEACHER",
        teacherRole: teacher.role,
        franchiseId: teacher.franchiseId,
        franchise: teacher.franchise,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  login,
};