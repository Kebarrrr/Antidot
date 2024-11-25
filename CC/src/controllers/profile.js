const User = require("../models/userModel");
const argon2 = require("argon2");
const path = require("path");
const fs = require("fs");

const getUser = async (req, res) => {
  try {
    const userID = req.userID;

    const user = await User.findByPk(userID, {
      attributes: ["fullName", "birthDate", "age", "email", "profilePicture"],
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

    const currentYear = new Date().getFullYear();
    const birthYear = new Date(birthDate).getFullYear();
    const age = currentYear - birthYear;

    if (file) {
      const currentProfilePicture = user.profilePicture;
      const defaultAvatarPath = `${req.protocol}://${req.get(
        "host"
      )}/public/uploads/default-avatar.png`;

      if (currentProfilePicture !== defaultAvatarPath) {
        // Hapus file lama jika bukan default-avatar
        const nameImage = currentProfilePicture.replace(
          `${req.protocol}://${req.get("host")}/public/uploads/`,
          ""
        );
        const filePath = path.join(__dirname, "../public/uploads/", nameImage);

        fs.unlink(filePath, (err) => {
          if (err) {
            return res.status(400).json({
              status: "fail",
              message: "File not found",
            });
          }
        });
      }

      // Update dengan file baru
      const fileName = file.filename;
      const pathFile = `${req.protocol}://${req.get(
        "host"
      )}/public/uploads/${fileName}`;
      user.profilePicture = pathFile;
    }

    user.fullName = fullName || user.fullName;
    user.birthDate = birthDate || user.birthDate;
    user.age = age || user.age;
    user.email = email || user.email;

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
    const userID = req.userID;

    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const currentProfilePicture = user.profilePicture;
    const defaultAvatarPath = `${req.protocol}://${req.get(
      "host"
    )}/public/uploads/default-avatar.png`;

    if (currentProfilePicture !== defaultAvatarPath) {
      // Hapus file lama jika bukan default-avatar
      const nameImage = currentProfilePicture.replace(
        `${req.protocol}://${req.get("host")}/public/uploads/`,
        ""
      );
      const filePath = path.join(__dirname, "../public/uploads/", nameImage);

      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(400).json({
            status: "fail",
            message: "File not found",
          });
        }
      });
    }

    await user.destroy();

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
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
