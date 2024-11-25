const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const profileController = require("../controllers/profile");
const { uploadOption } = require("../utils/fileUpload");

router.get("/", authenticate, profileController.getUser);
router.put(
  "/update",
  authenticate,
  uploadOption.single("profilePicture"),
  profileController.updateUser
);
router.delete("/delete", authenticate, profileController.deleteUser);
router.put("/updatePassword", authenticate, profileController.updatePassword);

module.exports = router;
