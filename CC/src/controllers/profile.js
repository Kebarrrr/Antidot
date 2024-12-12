const User = require("../models/userModel");
const argon2 = require("argon2");
const { Storage } = require("@google-cloud/storage");
const { format } = require("util");
const path = require("path");

// Google Cloud Storage configuration
const storage = new Storage({
  projectId: "united-planet-442804-p8",
});
const bucketName = "antidot-storage-bucket";
const bucket = storage.bucket(bucketName);

const getUser = async (req, res) => {
  try {
    const userID = req.userID;

    const user = await User.findByPk(userID, {
      attributes: [
        "userID",
        "fullName",
        "birthDate",
        "age",
        "email",
        "profilePicture",
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { fullName, birthDate, email } = req.body;
    const userID = req.userID;
    const file = req.file;

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (!fullName || !birthDate || !email) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields are required." });
    }

    const validEmail = await User.findOne({ where: { email } });
    if (validEmail && validEmail.userID !== userID) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email sudah digunakan." });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid email format." });
    }
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(birthDate).getFullYear();
    const age = currentYear - birthYear;

    let profilePictureUrl = user.profilePicture;

    // Handle profile picture upload to Cloud Storage
    if (file) {
      if (
        profilePictureUrl &&
        !profilePictureUrl.includes("default-avatar.png")
      ) {
        // Delete previous file from Cloud Storage if it's not the default avatar
        const oldFileName = profilePictureUrl.split("/").pop();
        const oldBlob = bucket.file(`profile-pictures/${oldFileName}`);
        await oldBlob.delete().catch(() => {
          console.warn("Previous profile picture not found.");
        });
      }

      // Upload new file
      const fileExtension = file.mimetype.split("/")[1];
      const uniqueFileName = `profile-pictures/${
        file.fieldname
      }-${Date.now()}.${fileExtension}`;
      const blob = bucket.file(uniqueFileName);

      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.end(file.buffer);

      profilePictureUrl = await new Promise((resolve, reject) => {
        blobStream.on("finish", () => {
          const publicUrl = format(
            `https://storage.googleapis.com/${bucketName}/${uniqueFileName}`
          );
          resolve(publicUrl);
        });

        blobStream.on("error", (err) => {
          reject(`Unable to upload to Cloud Storage: ${err.message}`);
        });
      });
    }

    // Update user details
    user.fullName = fullName;
    user.birthDate = birthDate;
    user.age = age;
    user.email = email;
    user.profilePicture = profilePictureUrl;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userID = req.userID; // User ID from authentication

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if user has a profile picture that needs to be deleted
    const profilePictureUrl = user.profilePicture;
    if (
      profilePictureUrl &&
      !profilePictureUrl.includes("default-avatar.png")
    ) {
      const fileName = profilePictureUrl.split("/").pop(); // Extract filename from URL
      const file = bucket.file(`profile-pictures/${fileName}`);

      // Attempt to delete the file from Cloud Storage
      await file.delete();
    }

    // Delete user from database
    await user.destroy();

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userID = req.userID;

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields are required." });
    }

    const validPassword = await argon2.verify(user.password, oldPassword);
    if (!validPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid old Password!" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: "fail",
        message:
          "Password must be at least 8 characters, include 1 uppercase letter, and 1 number.",
      });
    }

    const hashedPassword = await argon2.hash(newPassword);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  getUser,
  updateUser,
  deleteUser,
  updatePassword,
};
