const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const User = require("../models/userModel");
const { bucket } = require("@google-cloud/storage");

const register = async (req, res) => {
  try {
    const { fullName, birthDate, email, password, confPassword } = req.body;

    // Validasi input
    if (!fullName || !birthDate || !email || !password || !confPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields are required." });
    }

    const validEmail = await User.findOne({ where: { email } });
    if (validEmail) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email sudah digunakan." });
    }

    // Validasi password dan confirm password
    if (password !== confPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "Passwords do not match." });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid email format." });
    }

    // Validasi password (minimal 8 karakter, 1 huruf besar, 1 angka)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: "fail",
        message:
          "Password must be at least 8 characters, include 1 uppercase letter, and 1 number.",
      });
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Hitung usia
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(birthDate).getFullYear();
    const age = currentYear - birthYear;

    const profilePicture = `https://storage.googleapis.com/antidot-storage-bucket/profile-pictures/default-avatar.png`;

    // Simpan data pengguna ke database
    const newUser = await User.create({
      fullName,
      birthDate,
      age,
      email,
      password: hashedPassword,
      profilePicture,
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.errors.map((err) => err.message),
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email and password are required." });
    }

    // Cari pengguna berdasarkan email
    const userData = await User.findOne({ where: { email } });
    if (!userData) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid Email!" });
    }

    // Verifikasi password
    const validPassword = await argon2.verify(userData.password, password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid Password!" });
    }

    // Buat token JWT
    const token = jwt.sign(
      { userID: userData.userID },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: "success",
      message: "Login successful.",
      token,
      userData,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;

    const expiredToken = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "1s",
    });

    res.status(200).json({
      token: expiredToken,
      response: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
};
