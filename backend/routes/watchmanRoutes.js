const express = require("express");
const router = express.Router();

const {
  createWatchman,
  getWatchmen,
  updateWatchman,
  toggleWatchmanStatus,
} = require("../controllers/watchmanController");

const franchiseProtect= require("../middleware/franchiseAuthMiddleware");
 
 

router.use(franchiseProtect);

router.post("/", createWatchman);
router.get("/", getWatchmen);
router.put("/:id", updateWatchman);
router.patch("/:id/status", toggleWatchmanStatus);

module.exports = router;

