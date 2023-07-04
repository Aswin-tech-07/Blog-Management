const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userAuthenticationSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        user_no: {
            type: String,
        },
        auth_token: {
            type: String,
        },
        player_id: {
            type: String,
        },
        platform: {
            type: String,
        },
        status: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    },
);

/** @desc Hash plain password before saving
 *  @param {*} authToken
 */
userAuthenticationSchema.pre('save', async function (next) {
    const userAuth = this;
    if (userAuth.isModified('auth_token')) {
        userAuth.auth_token = await bcrypt.hash(userAuth.auth_token, 8);
    }
});

const UserAuthentication = mongoose.model(
    'UserAuthentication',
    userAuthenticationSchema,
);
module.exports = UserAuthentication;
