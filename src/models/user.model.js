/**
 * Model Definition File
 */

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

/**
 * Schema Definition
 */
const userSchema = new Schema(
    {
        id: {
            type: String,
        },
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

/**
 * Encryption method for the password field
 */
userSchema.pre('save', async function (next) {
    var user = this;
    if (user.isModified('password')) {
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
        next();
    } else {
        next();
    }
});

/**
 * Export Schema
 */
module.exports = mongoose.model('user', userSchema);
