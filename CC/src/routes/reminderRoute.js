const express = require("express");
const reminderController = require("../controllers/reminderController");
const authenticate = require("../middleware/authMiddleware"); // Pastikan sudah ada middleware autentikasi

const router = express.Router();

router.post("/create", authenticate, reminderController.createReminder);
router.get("/history", authenticate, reminderController.getUserReminders);
router.delete("/:reminderID", authenticate, reminderController.deleteReminder);

module.exports = router;
