const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const profileController = require("../controllers/profile");
const { uploadOption } = require("../utils/fileUpload");

// Route untuk mendapatkan data user
router.get("/", authenticate, profileController.getUser);

// Route untuk memperbarui data user (termasuk gambar profil)
router.put(
  "/update",
  authenticate,
  uploadOption.single("profilePicture"), // Middleware multer untuk menangkap file
  profileController.updateUser
);

// Route untuk menghapus user
router.delete("/delete", authenticate, profileController.deleteUser);

// Route untuk memperbarui password user
router.put("/updatePassword", authenticate, profileController.updatePassword);

module.exports = router;
