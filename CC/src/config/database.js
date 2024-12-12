const { Sequelize } = require("sequelize");

const db = new Sequelize("antidot", "root", "antidot123", {
  host: "34.50.73.225",
  dialect: "mysql",
});

module.exports = db;
