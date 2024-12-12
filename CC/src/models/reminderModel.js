const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/database");
const User = require("./userModel");
const Antibiotic = require("./antibioticModel");

const Reminder = db.define(
  "reminders",
  {
    reminderID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    antibioticID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Antibiotic,
        key: "antibioticID",
      },
    },
    customAntibioticName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reminderFrequency: {
      type: DataTypes.ENUM("1x sehari", "2x sehari", "3x sehari"),
      defaultValue: "1x sehari",
    },
    reminderTimes: {
      type: DataTypes.JSON,
      defaultValue: null,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: null,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

// Relasi antar tabel
Reminder.belongsTo(Antibiotic, { foreignKey: "antibioticID" });
Reminder.belongsTo(User, { foreignKey: "userID" });

module.exports = Reminder;
