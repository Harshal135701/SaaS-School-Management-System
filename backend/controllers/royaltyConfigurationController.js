const { RoyaltyConfiguration, Franchise } = require("../models");

const createRoyaltyConfiguration = async (req, res) => {
  try {
    const { franchiseId, royaltyType, amount, effectiveFrom } = req.body;

    if (!franchiseId || !royaltyType || amount === undefined || !effectiveFrom) {
      return res.status(400).json({
        success: false,
        message:
          "Franchise ID, royalty type, amount and effective date are required",
      });
    }

    if (!["FIXED", "PERCENTAGE"].includes(royaltyType)) {
      return res.status(400).json({
        success: false,
        message: "Royalty type must be FIXED or PERCENTAGE",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    if (royaltyType === "PERCENTAGE" && Number(amount) > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage royalty cannot exceed 100",
      });
    }

    const franchise = await Franchise.findByPk(franchiseId);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    const royaltyConfiguration = await RoyaltyConfiguration.create({
      franchiseId,
      royaltyType,
      amount,
      effectiveFrom,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Royalty configuration created successfully",
      data: royaltyConfiguration,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create royalty configuration",
    });
  }
};

const getRoyaltyConfigurations = async (req, res) => {
  try {
    const configurations = await RoyaltyConfiguration.findAll({
      include: [
        {
          model: Franchise,
          as: "franchise",
          attributes: ["id", "name", "code"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: configurations.length,
      data: configurations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch royalty configurations",
    });
  }
};

const getRoyaltyConfigurationsByFranchise = async (req, res) => {
  try {
    const { franchiseId } = req.params;

    const franchise = await Franchise.findByPk(franchiseId);

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: "Franchise not found",
      });
    }

    const configurations = await RoyaltyConfiguration.findAll({
      where: { franchiseId },
      order: [["effectiveFrom", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: configurations.length,
      data: configurations,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch franchise royalty configurations",
    });
  }
};

const updateRoyaltyConfiguration = async (req, res) => {
  try {
    const { id } = req.params;
    const { royaltyType, amount, effectiveFrom, isActive } = req.body;

    const configuration = await RoyaltyConfiguration.findByPk(id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: "Royalty configuration not found",
      });
    }

    if (
      royaltyType !== undefined &&
      !["FIXED", "PERCENTAGE"].includes(royaltyType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Royalty type must be FIXED or PERCENTAGE",
      });
    }

    const finalType = royaltyType || configuration.royaltyType;
    const finalAmount = amount !== undefined ? Number(amount) : Number(configuration.amount);

    if (finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    if (finalType === "PERCENTAGE" && finalAmount > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage royalty cannot exceed 100",
      });
    }

    await configuration.update({
      royaltyType: finalType,
      amount: finalAmount,
      effectiveFrom:
        effectiveFrom !== undefined
          ? effectiveFrom
          : configuration.effectiveFrom,
      isActive:
        isActive !== undefined ? isActive : configuration.isActive,
    });

    return res.status(200).json({
      success: true,
      message: "Royalty configuration updated successfully",
      data: configuration,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update royalty configuration",
    });
  }
};

module.exports = {
  createRoyaltyConfiguration,
  getRoyaltyConfigurations,
  getRoyaltyConfigurationsByFranchise,
  updateRoyaltyConfiguration,
};