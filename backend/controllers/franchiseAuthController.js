const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { FranchiseAdmin, Franchise } = require("../models");
const { Op } = require("sequelize");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await FranchiseAdmin.findOne({
      where: { email },
      include: [
        {
          model: Franchise,
          as: "franchise",
          attributes: ["id", "name", "code", "status", "planId"],
        },
      ],
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    if (!admin.franchise || admin.franchise.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Franchise is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "FRANCHISE_ADMIN",
        franchiseId: admin.franchiseId,
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
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "FRANCHISE_ADMIN",
        franchiseId: admin.franchiseId,
        franchise: admin.franchise,
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
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const admin = await FranchiseAdmin.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if email is being changed and is already in use
    if (email !== admin.email) {
      const existingEmail = await FranchiseAdmin.findOne({
        where: { email, id: { [Op.ne]: adminId } },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another admin",
        });
      }
    }

    admin.name = name.trim();
    admin.email = email.trim();
    if (phone !== undefined) {
      admin.phone = phone.trim();
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: "FRANCHISE_ADMIN",
        franchiseId: admin.franchiseId,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const admin = await FranchiseAdmin.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    admin.password = hashedPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getMe = async (req, res) => {
  try {
    const admin = await FranchiseAdmin.findByPk(req.user.id, {
      include: [{ model: Franchise, as: 'franchise' }]
    });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    return res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: 'FRANCHISE_ADMIN',
        franchiseId: admin.franchiseId,
        franchise: admin.franchise
      }
    });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getMe,
  login,
  updateProfile,
  changePassword,
};