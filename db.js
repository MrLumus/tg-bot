const { Sequelize } = require("sequelize");

module.exports = new Sequelize(
  "tg_bot_db",
  "root",
  "mrlumus",
  {
    host: "31.172.135.59",
    port: "6432",
    dialect: "postgres"
  },
);