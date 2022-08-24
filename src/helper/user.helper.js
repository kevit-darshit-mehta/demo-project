/**
 * System and 3rd party libs
 */
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Logger = require('../services/logger');

/**
 * Declarations & Implementations
 */
const checkForExistingUser = async ({ email }) => {
    try {
        const user = await User.findOne({
            email: { $regex: new RegExp('^' + email.toLowerCase() + '$', 'i') },
        }).lean();
        return !!user;
    } catch (e) {
        Logger.log.error('Error occurred while checking for existing user', e);
        return Promise.reject(e);
    }
};

/**
 * Service Export
 */
module.exports = {
    checkForExistingUser,
};
