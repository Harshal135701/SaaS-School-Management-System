const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Parent, Franchise } = require("../models");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const parent = await Parent.findOne({
      where: { email },
      include: [
        {
          model: Franchise,
          as: "franchise",
          attributes: ["id", "name", "code", "status"],
        },
      ],
    });

    if (!parent) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (parent.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Parent account is inactive",
      });
    }

    if (!parent.franchise || parent.franchise.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Franchise is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      parent.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: parent.id,
        email: parent.email,
        role: "PARENT",
        franchiseId: parent.franchiseId,
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
      parent: {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        role: "PARENT",
        franchiseId: parent.franchiseId,
        franchise: parent.franchise,
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