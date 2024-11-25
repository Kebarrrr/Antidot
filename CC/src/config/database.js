const { Sequelize } = require("sequelize");

const db = new Sequelize("antidot", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = db;
