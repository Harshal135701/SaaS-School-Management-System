"use strict";

const { Vendor, SchoolExpense } = require("../models");

// Create Vendor
exports.createVendor = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { name, contact, email, address, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vendor name is required",
      });
    }

    const vendorName = name.trim();

    const existingVendor = await Vendor.findOne({
      where: {
        franchiseId,
        name: vendorName,
      },
    });

    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: "Vendor already exists",
      });
    }

    const normalizedStatus = status || "ACTIVE";

    if (!["ACTIVE", "INACTIVE"].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor status",
      });
    }

    const vendor = await Vendor.create({
      franchiseId,
      name: vendorName,
      contact: contact?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      status: normalizedStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Create vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create vendor",
    });
  }
};

// Get All Vendors
exports.getVendors = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const vendors = await Vendor.findAll({
      where: {
        franchiseId,
      },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error("Get vendors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
    });
  }
};

// Get Vendor By ID
exports.getVendorById = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    const vendor = await Vendor.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Get vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendor",
    });
  }
};

// Update Vendor
exports.updateVendor = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    const { name, contact, email, address, status } = req.body;

    const vendor = await Vendor.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Vendor name cannot be empty",
        });
      }

      const vendorName = name.trim();

      const duplicate = await Vendor.findOne({
        where: {
          franchiseId,
          name: vendorName,
        },
      });

      if (duplicate && duplicate.id !== vendor.id) {
        return res.status(409).json({
          success: false,
          message: "Another vendor with this name already exists",
        });
      }

      vendor.name = vendorName;
    }

    if (contact !== undefined) {
      vendor.contact = contact === null ? null : contact.trim();
    }

    if (email !== undefined) {
      vendor.email = email === null ? null : email.trim();
    }

    if (address !== undefined) {
      vendor.address = address === null ? null : address.trim();
    }

    if (status !== undefined) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid vendor status",
        });
      }

      vendor.status = status;
    }

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Update vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vendor",
    });
  }
};

// Toggle Vendor Status
exports.toggleVendorStatus = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    const vendor = await Vendor.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    vendor.status = vendor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `Vendor ${
        vendor.status === "ACTIVE" ? "activated" : "deactivated"
      } successfully`,
      data: vendor,
    });
  } catch (error) {
    console.error("Toggle vendor status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vendor status",
    });
  }
};

// Delete Vendor
exports.deleteVendor = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    const vendor = await Vendor.findOne({
      where: {
        id,
        franchiseId,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const expenseCount = await SchoolExpense.count({
      where: {
        franchiseId,
        vendorId: id,
      },
    });

    if (expenseCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Vendor cannot be deleted because it is linked to existing expenses. Deactivate it instead.",
      });
    }

    await vendor.destroy();

    return res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Delete vendor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete vendor",
    });
  }
};