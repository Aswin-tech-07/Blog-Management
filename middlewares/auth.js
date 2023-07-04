const responseHandler = require('./responseHandlers');
const { writeErrorLog } = require('./errorHandlers');
const UserAuthentication = require('../src/models/userAuthenticationModel');
const UserModel = require('../src/models/usersModel');

/**
 * Class Users
 * created on 05-04-2023
 */
class AuthMiddleware {
    /**
     * @desc Auth check
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    authCheck = async (req, res, next) => {
        try {
            const headers = req.headers || {};
            const userNo = headers['x-consumer-custom-id'] || '';
            const platform = headers.platform || '';
            const authToken = headers.auth_token || '';
            // if (userNo && platform) {
            if (userNo && platform && authToken) {
                const authData = await UserAuthentication.findOne({
                    user_no: userNo,
                    platform: platform,
                    // auth_token: authToken,
                    status: 1,
                })
                    .select([
                        '-_id',
                        '-platform',
                        '-auth_token',
                        '-player_id',
                        '-createdAt',
                        '-updatedAt',
                        '-status',
                        '-user_no',
                    ])
                    .populate({
                        path: 'user_id',
                        select: '-_id username',
                        match: { status: 1 },
                    });
                if (authData && authData.user_id) {
                    next();
                } else {
                    responseHandler(res, 401, {
                        message: 'Unauthorised Access!!',
                    });
                }
            } else {
                responseHandler(res, 400, {
                    message: 'Unauthorised Access!',
                });
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 500, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc user access
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    userAccess = async (req, res, next) => {
        try {
            const headers = req.headers || {};
            const userNo = headers['x-consumer-custom-id'] || '';
            if (userNo) {
                const user = await UserModel.exists({
                    user_no: userNo,
                    role: 'admin',
                    status: 1,
                });
                if (user) {
                    next();
                } else {
                    responseHandler(res, 400, {
                        message: 'Unauthorised Access for the User!!',
                    });
                }
            } else {
                responseHandler(res, 400, {
                    message: 'Unauthorised Access!!!',
                });
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 500, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };
}

module.exports = AuthMiddleware;
