const { Franchise, FranchiseAdmin, MonthlyRoyalty } = require("../models");

const getDashboard = async (req, res) => {
  try {
    const totalFranchises = await Franchise.count();

    const activeFranchises = await Franchise.count({
      where: {
        status: "ACTIVE",
      },
    });

    const inactiveFranchises = await Franchise.count({
      where: {
        status: "INACTIVE",
      },
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
    console.error("Get Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};