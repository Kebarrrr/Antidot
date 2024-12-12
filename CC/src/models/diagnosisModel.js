const db = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");
const User = require("./userModel"); // Require userModel

const Diagnosis = db.define(
  "diagnosis",
  {
    diagnosisID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Mengacu pada model User
        key: "userID",
      },
    },
    disease: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    disease_description: {
      type: DataTypes.TEXT, // Menggunakan tipe TEXT untuk deskripsi penyakit
      allowNull: true,
    },
    antibiotic_frequency_usage_per_day: {
      type: DataTypes.ENUM("1x sehari", "2x sehari", "3x sehari"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.TIME, // Menggunakan tipe TIME untuk hanya mencatat jam
      allowNull: false,
      defaultValue: Sequelize.NOW, // Menggunakan waktu saat ini
    },
    updatedAt: {
      type: DataTypes.TIME, // Menggunakan tipe TIME untuk hanya mencatat jam
      allowNull: false,
      defaultValue: Sequelize.NOW, // Menggunakan waktu saat ini
    },
  },
  {
    freezeTableName: true,
    timestamps: true, // Agar Sequelize otomatis menangani createdAt dan updatedAt
  }
);

// Relasi: Diagnosis belongsTo User
Diagnosis.belongsTo(User, { foreignKey: "userID" });

module.exports = Diagnosis;
