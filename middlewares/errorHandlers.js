require('dotenv').config();
const fs = require('fs');
const path = require('path');

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

const writeErrorLog = error => {
    const date = new Date();
    const logMessage = `[${date.toISOString()}] ${error.stack}\n`;
    fs.appendFile(path.join(__dirname, '../log/error.log'), logMessage, err => {
        if (err) {
            console.error('Failed to write error log:', err);
        }
    });
};
module.exports = { notFound, errorHandler, writeErrorLog };
