const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const rolesEnum = require('../../Utils/roles');
// const responseHandler = require('../../middlewares/responseHandlers');
const { writeErrorLog } = require('../../middlewares/errorHandlers');

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        user_no: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid');
                }
            },
        },
        password: {
            type: String,
            required: true,
            minLength: 7,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    // eslint-disable-next-line prettier/prettier
                    throw new Error('password musn\'t contain password');
                }
            },
        },
        status: {
            type: Number,
            default: 1,
        },
        role: {
            type: String,
            enum: Object.values(rolesEnum),
            default: rolesEnum.USER,
        },
    },
    {
        timestamps: true,
    },
);

/** @desc login in users
 *  @param {*} email
 * @param {*} password
 * @param {*} res
 */
userSchema.statics.findByCredentials = async (email, password, res) => {
    try {
        const user = await User.findOne({ email }).select([
            '_id',
            'username',
            'user_no',
            'email',
            'role',
            'password',
            'createdAt',
            'updatedAt',
        ]);
        if (!user) {
            // responseHandler(res, 401, {
            //     message: 'Invalid Login credentials',
            // });
            return 400;
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                // responseHandler(res, 401, {
                //     message: 'Invalid Login credentials!',
                // });
                return 401;
            } else {
                return user;
            }
        }
    } catch (err) {
        writeErrorLog(err);
        throw new Error('something ent wrong');
    }
};

/** @desc Hash plain password before saving
 *  @param {*} email
 * @param {*} password
 */
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
