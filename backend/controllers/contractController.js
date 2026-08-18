const Contract = require("../models/Contract");
const Franchise =require("../models/Franchise")
// Create Contract
exports.createContract = async (req, res) => {
  try {
    const {
      franchiseId,
      agreementNumber,
      agreementType,
      startDate,
      endDate,
      documentUrl,
      notes,
    } = req.body;

    const contract = await Contract.create({
      franchiseId,
      agreementNumber,
      agreementType,
      startDate,
      endDate,
      documentUrl,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Contract created successfully",
      data: contract,
    });
  } catch (error) {
    console.error("Create Contract Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create contract",
      error: error.message,
    });
  }
};

// Get All Contracts
// Get All Contracts
exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
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
      count: contracts.length,
      data: contracts,
    });
  } catch (error) {
    console.error("Get Contracts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contracts",
      error: error.message,
    });
  }
};

// Get Contract By ID
exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    console.error("Get Contract Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch contract",
      error: error.message,
    });
  }
};

// Update Contract
exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    await contract.update(req.body);

    res.status(200).json({
      success: true,
      message: "Contract updated successfully",
      data: contract,
    });
  } catch (error) {
    console.error("Update Contract Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update contract",
      error: error.message,
    });
  }
};

// Renew Contract
exports.renewContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body || {};

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const contract = await Contract.findByPk(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    await contract.update({
      startDate,
      endDate,
      status: "RENEWED",
    });

    res.status(200).json({
      success: true,
      message: "Contract renewed successfully",
      data: contract,
    });
  } catch (error) {
    console.error("Renew Contract Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to renew contract",
      error: error.message,
    });
  }
};

// Delete Contract
exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    await contract.destroy();

    res.status(200).json({
      success: true,
      message: "Contract deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contract Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete contract",
      error: error.message,
    });
  }
};