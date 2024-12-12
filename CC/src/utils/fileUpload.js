const multer = require("multer");

// Configure multer to use memory storage
const uploadOption = multer({
  storage: multer.memoryStorage(), // Store file in memory
  fileFilter: (req, file, cb) => {
    const validTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (!validTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed.")
      );
    }
    cb(null, true);
  },
});

module.exports = { uploadOption };
