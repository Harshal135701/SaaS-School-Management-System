const {
  MonthlyRoyalty,
  RoyaltyConfiguration,
  Franchise,
} = require("../models");

const { Op } = require("sequelize");

const createMonthlyRoyalty = async (req, res) => {
  try {
    const { franchiseId, billingMonth, dueDate } = req.body;

    if (!franchiseId || !billingMonth || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Franchise ID, billing month and due date are required",
      });
    }

    const franchise = await Franchise.findByPk(franchiseId, {
      include: [
        {
          model: require("../models/Plan"),
          as: "plan",
        },
      ],
    });

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    if (!franchise.plan) {
      return res.status(400).json({
        success: false,
        message: "No plan assigned to this franchise",
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
        message: "Monthly bill for this franchise already exists",
      });
    }

    // Calculate the last day of the billing month to allow mid-month configurations
    const [year, month] = billingMonth.split('-');
    const lastDay = new Date(year, month, 0).getDate();
    const endOfMonthStr = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    // Find active royalty configuration
    const configuration = await RoyaltyConfiguration.findOne({
      where: {
        franchiseId,
        isActive: true,
        effectiveFrom: {
          [Op.lte]: endOfMonthStr,
        },
      },
      order: [["effectiveFrom", "DESC"]],
    });

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Active royalty configuration not found",
      });
    }

    // Plan price
    const planAmount = Number(franchise.plan.price);

    // Calculate royalty
    let royaltyAmount;

    if (configuration.royaltyType === "FIXED") {
      royaltyAmount = Number(configuration.amount);
    } else {
      royaltyAmount = (planAmount * Number(configuration.amount)) / 100;
    }

    // Final price = Plan + Royalty
    const totalAmount = planAmount + royaltyAmount;

    const monthlyRoyalty = await MonthlyRoyalty.create({
      franchiseId,
      billingMonth,

      planAmount: planAmount.toFixed(2),

      baseAmount: planAmount.toFixed(2),

      royaltyType: configuration.royaltyType,

      royaltyRate: Number(configuration.amount).toFixed(2),

      royaltyAmount: royaltyAmount.toFixed(2),

      totalAmount: totalAmount.toFixed(2),

      dueDate,

      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Monthly bill generated successfully",
      data: monthlyRoyalty,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly bill",
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
      include: [
        {
          model: Franchise,
          as: "franchise",
          attributes: ["id", "name", "code"],
          include: [
            {
              model: require("../models/Plan"),
              as: "plan",
              attributes: ["name", "price", "billingCycle"],
            },
          ],
        },
      ],
      order: [["billingMonth", "DESC"]],
    });

    const totalAmount = royalties.reduce(
      (sum, item) => sum + Number(item.totalAmount),
      0
    );

    const paidAmount = royalties
      .filter((item) => item.status === "PAID")
      .reduce((sum, item) => sum + Number(item.totalAmount), 0);

    const pendingAmount = royalties
      .filter((item) => item.status === "PENDING")
      .reduce((sum, item) => sum + Number(item.totalAmount), 0);

    const overdueAmount = royalties
      .filter((item) => item.status === "OVERDUE")
      .reduce((sum, item) => sum + Number(item.totalAmount), 0);

    return res.status(200).json({
      success: true,

      summary: {
        totalBills: royalties.length,

        paidBills: royalties.filter(
          (item) => item.status === "PAID"
        ).length,

        pendingBills: royalties.filter(
          (item) => item.status === "PENDING"
        ).length,

        overdueBills: royalties.filter(
          (item) => item.status === "OVERDUE"
        ).length,

        totalAmount: totalAmount.toFixed(2),
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
      message: "Failed to generate billing report",
    });
  }
};

module.exports = {
  createMonthlyRoyalty, getMonthlyRoyalties, updateMonthlyRoyaltyStatus, getRoyaltyReport
};