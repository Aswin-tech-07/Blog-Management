const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();
require('../config/mongoDb.config');
const { notFound, errorHandler } = require('../middlewares/errorHandlers');

const v1Service = require('../routes/v1Routes');
const uploadService = require('../routes/uploadRoutes');

const app = express();

// const corsOptions = {
//     origin: 'http://localhost:8000',
// };
// app.use(cors(corsOptions));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, '../log/debug.log'),
    { flags: 'a' },
);

// setup the logger
app.use(
    logger('combined', {
        skip: function (req, res) {
            return res.statusCode < 400;
        },
        stream: accessLogStream,
    }),
);
// app.use(logger('dev'));

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/v1', v1Service);
app.use('/upload', uploadService);
// Error Handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
