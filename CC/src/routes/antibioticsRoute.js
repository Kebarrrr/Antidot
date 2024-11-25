const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const antibioticsController = require("../controllers/antibiotics");

router.get("/", authenticate, antibioticsController.getAllAntibiotics);

module.exports = router;
