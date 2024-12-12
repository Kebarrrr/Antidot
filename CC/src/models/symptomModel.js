const db = require("../config/database");
const { Sequelize, DataTypes } = require("sequelize");

const symtom = db.define(
  "symptoms",
  {
    symptomID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    symptomName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = symtom;
