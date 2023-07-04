const mongoose = require('mongoose');
const responseHandler = require('../middlewares/responseHandlers');
const { writeErrorLog } = require('../middlewares/errorHandlers');

// eslint-disable-next-line no-useless-catch
try {
    mongoose
        .connect('mongodb://0.0.0.0/mydatabase', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        // .then(() => console.log('Database connected'))
        .catch(err => console.log(err));
    // };
    // connect();
} catch (err) {
    writeErrorLog(err);
    responseHandler(res, 500, {
        message: 'Database could not be connected',
    });
}
