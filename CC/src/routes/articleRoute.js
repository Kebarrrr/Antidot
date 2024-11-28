const express = require("express");
const articleControllers = require("../controllers/articles");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, articleControllers.getArticle);

module.exports = router;
