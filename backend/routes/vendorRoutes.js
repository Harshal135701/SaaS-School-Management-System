"use strict";

const express = require("express");
const router = express.Router();

const vendorController = require("../controllers/vendorController");

const franchiseAuthMiddleware = require("../middleware/franchiseAuthMiddleware");

router.use(franchiseAuthMiddleware);

router.post("/", vendorController.createVendor);

router.get("/", vendorController.getVendors);

router.get("/:id", vendorController.getVendorById);

router.put("/:id", vendorController.updateVendor);

router.patch(
  "/:id/toggle-status",
  vendorController.toggleVendorStatus
);

router.delete("/:id", vendorController.deleteVendor);

module.exports = router;