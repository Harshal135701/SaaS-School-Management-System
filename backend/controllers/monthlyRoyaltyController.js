const {
  MonthlyRoyalty,
  RoyaltyConfiguration,
  Franchise,
} = require("../models");

const { Op } = require("sequelize");

const createMonthlyRoyalty = async (req, res) => {
  try {
    const { franchiseId, billingMonth, baseAmount, dueDate } = req.body;

    if (!franchiseId || !billingMonth || baseAmount === undefined || !dueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Franchise ID, billing month, base amount and due date are required",
      });
    }

    if (Number(baseAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Base amount must be greater than 0",
      });
    }

    const franchise = await Franchise.findByPk(franchiseId);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    // Prevent duplicate monthly bill
    const existingRoyalty = await MonthlyRoyalty.findOne({
      where: {
        franchiseId,
        billingMonth,
      },
    });

    if (existingRoyalty) {
      return res.status(409).json({
        success: false,
        message: "Royalty for this franchise and month already exists",
      });
    }

    // Find active royalty configuration
    const configuration = await RoyaltyConfiguration.findOne({
      where: {
        franchiseId,
        isActive: true,
      },
      order: [["effectiveFrom", "DESC"]],
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Active royalty configuration not found",
      });
    }

    let royaltyAmount;

    if (configuration.royaltyType === "FIXED") {
      royaltyAmount = Number(configuration.amount);
    } else {
      royaltyAmount =
        (Number(baseAmount) * Number(configuration.amount)) / 100;
    }

    const monthlyRoyalty = await MonthlyRoyalty.create({
      franchiseId,
      billingMonth,
      baseAmount,
      royaltyType: configuration.royaltyType,
      royaltyRate: configuration.amount,
      royaltyAmount: royaltyAmount.toFixed(2),
      dueDate,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Monthly royalty generated successfully",
      data: monthlyRoyalty,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly royalty",
    });
  }
};

const getMonthlyRoyalties = async (req, res) => {
  try {
    const { status, franchiseId } = req.query;

    const where = {};

    if (status) {
      if (!["PENDING", "PAID", "OVERDUE"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be PENDING, PAID or OVERDUE",
        });
      }

      where.status = status;
    }

    if (franchiseId) {
      where.franchiseId = franchiseId;
    }

    const royalties = await MonthlyRoyalty.findAll({
      where,
      include: [
        {
          model: Franchise,
          as: "franchise",
          attributes: ["id", "name", "code"],
        },
      ],
      order: [["billingMonth", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: royalties.length,
      data: royalties,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly royalties",
    });
  }
};

const updateMonthlyRoyaltyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "PAID", "OVERDUE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be PENDING, PAID or OVERDUE",
      });
    }

    const royalty = await MonthlyRoyalty.findByPk(id);

    if (!royalty) {
      return res.status(404).json({
        success: false,
        message: "Monthly royalty not found",
      });
    }

    royalty.status = status;
    await royalty.save();

    return res.status(200).json({
      success: true,
      message: `Royalty marked as ${status.toLowerCase()} successfully`,
      data: royalty,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update royalty status",
    });
  }
};

const getRoyaltyReport = async (req, res) => {
  try {
    const { franchiseId, from, to } = req.query;

    const where = {};

    if (franchiseId) {
      where.franchiseId = franchiseId;
    }

    if (from || to) {
      where.billingMonth = {};

      if (from) {
        where.billingMonth[Op.gte] = from;
      }

      if (to) {
        where.billingMonth[Op.lte] = to;
      }
    }

    const royalties = await MonthlyRoyalty.findAll({
      where,
      order: [["billingMonth", "DESC"]],
    });

    const totalRoyalty = royalties.reduce(
      (sum, item) => sum + Number(item.royaltyAmount),
      0
    );

    const paidAmount = royalties
      .filter((item) => item.status === "PAID")
      .reduce((sum, item) => sum + Number(item.royaltyAmount), 0);

    const pendingAmount = royalties
      .filter((item) => item.status === "PENDING")
      .reduce((sum, item) => sum + Number(item.royaltyAmount), 0);

    const overdueAmount = royalties
      .filter((item) => item.status === "OVERDUE")
      .reduce((sum, item) => sum + Number(item.royaltyAmount), 0);

    return res.status(200).json({
      success: true,
      summary: {
        totalBills: royalties.length,
        paidBills: royalties.filter((item) => item.status === "PAID").length,
        pendingBills: royalties.filter((item) => item.status === "PENDING").length,
        overdueBills: royalties.filter((item) => item.status === "OVERDUE").length,

        totalRoyalty: totalRoyalty.toFixed(2),
        paidAmount: paidAmount.toFixed(2),
        pendingAmount: pendingAmount.toFixed(2),
        overdueAmount: overdueAmount.toFixed(2),
      },
      data: royalties,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate royalty report",
    });
  }
};

module.exports = {
  createMonthlyRoyalty,getMonthlyRoyalties,updateMonthlyRoyaltyStatus,getRoyaltyReport
};