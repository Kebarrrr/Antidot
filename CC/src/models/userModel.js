const db = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");

const user = db.define(
  "users",
  {
    userID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "default-avatar.png",
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = user;
