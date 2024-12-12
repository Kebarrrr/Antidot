const db = require("../config/database"); // Sesuaikan dengan file konfigurasi database Anda
const { Sequelize, DataTypes } = require("sequelize");

const Antibiotic = db.define(
  "antibiotics",
  {
    antibioticID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    disease: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    disease_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    antibiotics_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    antibiotics_usage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    antibiotics_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    antibiotics_dosage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    antibiotic_frequency_usage_per_day: {
      type: DataTypes.ENUM("1x sehari", "2x sehari", "3x sehari"),
      allowNull: false,
    },
    antibiotic_total_days_of_usage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    others: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    antibiotic_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false, // Karena tidak ada field createdAt / updatedAt pada tabel ini
  }
);

module.exports = Antibiotic;
