require('dotenv').config();
const { Sequelize, Model } = require('sequelize');
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DIALECT,
        operatorsAliases: 0,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: false,
    },
);
sequelize
    .authenticate()
    .then(() => {
        // console.log('Synced db.');
    })
    .catch(err => {
        // console.log('Failed to sync db: ' + err.message);
        writeErrorLog(err);
    });
module.exports = {
    sequelize,
    Sequelize,
    Model,
};
