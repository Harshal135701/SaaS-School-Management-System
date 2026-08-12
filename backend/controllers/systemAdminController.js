const { Franchise, FranchiseAdmin } = require("../models");

const getDashboard = async (req, res) => {
  try {
    const totalFranchises = await Franchise.count();

    const activeFranchises = await Franchise.count({
      where: { status: "ACTIVE" },
    });

    const inactiveFranchises = await Franchise.count({
      where: { status: "INACTIVE" },
    });

    const totalFranchiseAdmins = await FranchiseAdmin.count();

    return res.status(200).json({
      success: true,
      data: {
        totalFranchises,
        activeFranchises,
        inactiveFranchises,
        totalFranchiseAdmins,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

module.exports = {
  getDashboard,
};