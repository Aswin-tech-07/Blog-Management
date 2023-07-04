const responseHandler = (res, statusCode, responseObject) => {
    const responseData = {
        message: responseObject.message
            ? responseObject.message
            : res < 300
            ? 'data fetched successfully'
            : 'something went wrong',
        data: responseObject.data ? responseObject.data : [],
    };

    res.status(statusCode).json(responseData);
};

module.exports = responseHandler;
