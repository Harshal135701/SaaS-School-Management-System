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

    const teacher = await Teacher.scope("withPassword").findOne({
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
        role: teacher.role,
        staffType: teacher.staffType,
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
        role: teacher.role,
        staffType: teacher.staffType,
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

const getMe = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.user.id, {
      include: [
        {
          model: Franchise,
          as: "franchise",
          attributes: ["id", "name", "code", "status"],
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        role: teacher.role,
        staffType: teacher.staffType,
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

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const teacher = await Teacher.findByPk(req.user.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (name) {
      teacher.name = name.trim();
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();

      const emailExists = await Teacher.findOne({
        where: { email: normalizedEmail },
      });

      if (emailExists && emailExists.id !== teacher.id) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      teacher.email = normalizedEmail;
    }

    if (phone !== undefined) {
      teacher.phone = phone ? phone.trim() : null;
    }

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        role: teacher.role,
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

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    const teacher = await Teacher.scope("withPassword").findByPk(
      req.user.id
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      teacher.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(newPassword, salt);

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
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
  getMe,
  updateProfile,
  changePassword,
};