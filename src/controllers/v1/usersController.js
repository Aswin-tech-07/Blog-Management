const responseHandler = require('../../../middlewares/responseHandlers');
const { writeErrorLog } = require('../../../middlewares/errorHandlers');
let CommonController = new require('../CommonController');
CommonController = new CommonController();
const User = require('../../models/usersModel');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const UserAuthenticationModel = require('../../models/userAuthenticationModel');
require('dotenv').config();
const bcrypt = require('bcryptjs');

/**
 * Class Users
 * created on 05-04-2023
 */
class UsersController {
    /** api starts */

    /**
     * @desc signup api
     * @route /v1/signup/:role
     * @param {*} req
     * @param {*} res
     */
    userSignup = async (req, res) => {
        try {
            const postData = req.body || {};
            const role = req.params.role || '';
            if (postData) {
                if (
                    postData.username &&
                    postData.email &&
                    postData.password &&
                    role
                ) {
                    const user = await User.findOne({ email: postData.email });
                    if (!user) {
                        const uniqid = await CommonController.getUniqid();
                        postData.user_no = 'FLSADMN' + uniqid;
                        postData.role = role;
                        if (role == 'admin' || role == 'user') {
                            const user = new User(postData);
                            const savedUser = await user.save();
                            if (savedUser) {
                                const consumerResponse = await axios.post(
                                    process.env.KONG_URL + '/consumers',
                                    {
                                        username: postData.user_no,
                                        custom_id: postData.user_no,
                                    },
                                );
                                if (consumerResponse.data.id) {
                                    await axios.post(
                                        `${process.env.KONG_URL}/consumers/${consumerResponse.data.id}/acls`,
                                        {
                                            group: 'Admin',
                                        },
                                    );
                                }
                                const responseData = {
                                    message: 'User Created successfully',
                                    data: savedUser,
                                };
                                responseHandler(res, 201, responseData);
                            } else {
                                responseHandler(res, 304, {
                                    message: 'Failed to signup!',
                                });
                            }
                        } else {
                            responseHandler(res, 401, {
                                message: 'No Route Found!',
                            });
                        }
                    } else {
                        responseHandler(res, 422, {
                            message: 'email already exist!',
                        });
                    }
                } else {
                    responseHandler(res, 422, {
                        message: 'Mandatory Fields are missing',
                    });
                }
            } else {
                responseHandler(res, 404, {
                    message: 'Invalid request!',
                });
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc login api
     * @route /v1/login
     * @param {*} req
     * @param {*} res
     */
    userLogin = async (req, res) => {
        try {
            if (req.body.email && req.body.password) {
                const user = await User.findByCredentials(
                    req.body.email,
                    req.body.password,
                    res,
                );

                if (user != 400 && user != 401) {
                    delete user.password;
                    let token;
                    const consumer = await this.getKongConsumer(
                        user.user_no,
                        res,
                    );
                    if (consumer) {
                        const key = { iss: consumer.key || '' };
                        const secret = consumer.secret || '';

                        token = jwt.sign(key, secret, {
                            algorithm: 'HS256',
                        });
                    } else {
                        token = '';
                    }
                    let authToken = Math.floor(Date.now() / 1000);

                    const authData = {
                        user_id: user._id,
                        user_no: user.user_no,
                        auth_token: authToken + user._id,
                        player_id: req.body.player_id || '',
                        platform: req.headers.platform || 'unknown',
                    };
                    let userAuth = new UserAuthenticationModel(authData);
                    userAuth = await userAuth.save();
                    authToken = userAuth.auth_token || '';
                    const responseData = {
                        message: 'User login successfully',
                        data: {
                            // user,
                            user_id: user.user_no,
                            user_type: user.role,
                            authentication: token || 'testingWithoutDocker',
                            auth_token: authToken,
                        },
                    };
                    responseHandler(res, 201, responseData);
                } else if (user == 401) {
                    responseHandler(res, 401, {
                        message: 'Invalid Login credentials!',
                    });
                } else {
                    responseHandler(res, 401, {
                        message: 'Invalid Login credentials!',
                    });
                }
            } else {
                responseHandler(res, 401, {
                    message: 'Invalid Login credentials!',
                });
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc user logout
     * @route /v1/logout
     * @param {*} req
     * @param {*} res
     */
    userLogout = async (req, res) => {
        try {
            const headers = req.headers || {};
            const userNo = headers['x-consumer-custom-id'] || '';
            const platform = headers.platform || '';
            const result = await UserAuthenticationModel.updateMany(
                {
                    user_no: userNo,
                    platform: platform,
                },
                {
                    status: 0,
                },
            );
            if (result) {
                const responseData = {
                    message: 'logged out successfully',
                    data: {},
                };
                responseHandler(res, 201, responseData);
            } else {
                responseHandler(res, 401, {
                    message: 'failed to logout',
                });
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc change password
     * @route /v1/changePassword
     * @param {*} req
     * @param {*} res
     */
    changePassword = async (req, res) => {
        try {
            const postData = req.body || {};
            const headers = req.headers || {};
            const userNo = headers['x-consumer-custom-id'] || '';
            const emailId = postData.email || '';
            if (
                postData &&
                postData.old_password &&
                postData.new_password &&
                userNo
            ) {
                const user = await User.findOne({ user_no: userNo }).select([
                    '_id',
                    'password',
                ]);
                if (user) {
                    const isMatch = await bcrypt.compare(
                        postData.old_password,
                        user.password,
                    );
                    if (isMatch) {
                        postData.new_password = await bcrypt.hash(
                            postData.new_password,
                            8,
                        );
                        const savedUser = await User.updateOne(
                            { user_no: userNo },
                            { password: postData.new_password },
                            {
                                new: true,
                                upsert: false,
                            },
                        );
                        const responseData = {
                            message: 'password change successfully',
                            data: savedUser,
                        };
                        responseHandler(res, 201, responseData);
                    } else {
                        responseHandler(res, 401, {
                            message: 'invalid previous password',
                        });
                    }
                } else {
                    responseHandler(res, 401, {
                        message: 'user details not found',
                    });
                }
            } else if (
                postData &&
                postData.old_password &&
                postData.new_password &&
                emailId
            ) {
                const user = await User.findOne({ email: emailId }).select([
                    '_id',
                    'password',
                ]);
                if (user) {
                    const isMatch = await bcrypt.compare(
                        postData.old_password,
                        user.password,
                    );
                    if (isMatch) {
                        postData.new_password = await bcrypt.hash(
                            postData.new_password,
                            8,
                        );
                        const savedUser = await User.updateOne(
                            { email: emailId },
                            { password: postData.new_password },
                            {
                                new: true,
                                upsert: false,
                            },
                        );
                        const responseData = {
                            message: 'password change successfully',
                            data: savedUser,
                        };
                        responseHandler(res, 201, responseData);
                    } else {
                        responseHandler(res, 401, {
                            message: 'invalid previous password',
                        });
                    }
                } else {
                    responseHandler(res, 401, {
                        message: 'Invalid Email Id',
                    });
                }
            } else {
                responseHandler(res, 422, {
                    message: 'Mandatory Fields are missing!',
                });
            }
        } catch (err) {
            writeErrorLog(err);

            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /**
     * @desc status change
     * @param {*} req
     * @param {*} res
     */
    statusChange = async (req, res) => {
        try {
            const postData = req.body || {};

            if (postData && postData.user_no) {
                const user = await User.findOne({
                    user_no: postData.user_no || '',
                });

                if (user) {
                    const savedUser = await User.findOneAndUpdate(
                        {
                            user_no: user.user_no,
                        },
                        {
                            status: user.status ? 0 : 1,
                        },
                        {
                            new: true,
                            upsert: false,
                        },
                    );
                    if (savedUser) {
                        const responseData = {
                            message: 'status updated successfully',
                            data: {},
                        };
                        responseHandler(res, 201, responseData);
                    } else {
                        responseHandler(res, 304, {
                            message: 'failed to change status',
                        });
                    }
                } else {
                    responseHandler(res, 404, {
                        message: 'no data found',
                    });
                }
            } else {
                responseHandler(res, 422, {
                    message: 'mandatory fields are missing',
                });
            }
        } catch (err) {
            writeErrorLog(err);
            responseHandler(res, 400, {
                message: 'something went wrong, try again sometime!',
            });
        }
    };

    /** api ends */

    /** internal functions starts */

    getKongConsumer = async (username, res) => {
        try {
            const consumer = await axios.post(
                `${process.env.KONG_URL}/consumers/${username}/${process.env.KONG_JWT_PLUGIN_NAME}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );
            if (!consumer && consumer.status != 201) {
                return '';
            } else {
                return consumer.data || {};
            }
        } catch (err) {
            writeErrorLog(err);
            return '';
        }
    };
    /** internal functions end */
}
module.exports = UsersController;
