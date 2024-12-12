const express = require("express");
const router = express.Router();
const diagnosisController = require("../controllers/diagnosisController");
const authenticate = require("../middleware/authMiddleware"); // Middleware untuk autentikasi JWT

// Route untuk membuat diagnosis
router.post("/predict", authenticate, diagnosisController.createDiagnosis);
router.get("/history", authenticate, diagnosisController.diagnosisHistory);
router.get("/symptoms", authenticate, diagnosisController.getAllSymptom);

module.exports = router;
