const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { FranchiseAdmin, Franchise } = require("../models");

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

module.exports = {
  login,
};