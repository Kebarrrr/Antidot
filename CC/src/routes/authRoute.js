const express = require("express");
const authControllers = require("../controllers/auth");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authControllers.register);
router.post("/login", authControllers.login);
router.post("/logout", authenticate, authControllers.logout);

module.exports = router;
