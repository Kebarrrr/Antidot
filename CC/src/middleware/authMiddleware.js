const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Pastikan path ke model benar

const authenticate = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(
      res.status(401).json({
        status: "fail",
        message: "anda belum Login, token tidak ditemukan",
      })
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(
      res.status(401).json({
        status: "fail",
        message: "anda belum Login, token tidak ditemukan",
      })
    );
  }

  const currentUser = await User.findByPk(decoded.userID);
  if (!currentUser) {
    return next(
      res.status(401).json({
        status: "fail",
        message: "User not found",
      })
    );
  }
  req.User = currentUser;
  req.userID = decoded.userID;
  next();
};

module.exports = authenticate;
