/**
 * Model Definition File
 */

/**
 * System and 3rd Party libs
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

/**
 * Schema Definition
 */

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
        },
        password: {
            type: String,
        },
        course: [
            {
                name: {
                    type: String,
                },
                video: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true },
);

userSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                throw err;
            }
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    throw err;
                }
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

/**
 * Export Schema
 */
module.exports = mongoose.model('user', userSchema);
