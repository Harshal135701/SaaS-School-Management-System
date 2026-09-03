const { Franchise, FranchiseAdmin } = require("../models");

const getDashboard = async (req, res) => {
  try {
    const franchise = await Franchise.findOne({
      where: {
        id: req.user.franchiseId,
      },
      attributes: [
        "id",
        "name",
        "code",
        "email",
        "phone",
        "city",
        "state",
        "status",
        "planId",
      ],
      include: [
        {
          model: FranchiseAdmin,
          as: "admin",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        franchise: {
          ...franchise.toJSON(),
          adminName: franchise.admin?.name || "",
          adminEmail: franchise.admin?.email || "",
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDashboard,
};