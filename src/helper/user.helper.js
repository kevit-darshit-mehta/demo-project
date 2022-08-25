/**
 * System and 3rd party libs
 */
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Logger = require('../services/logger');

/**
 * Declarations & Implementations
 */

/**
 * Helper function to check for existing user
 * @param {string} email - user's email
 * @returns boolean
 */
const checkForExistingUser = async ({ email }) => {
    try {
        const user = await User.findOne({
            email: { $regex: new RegExp('^' + email.toLowerCase() + '$', 'i') },
        }).lean();
        return !!user;
    } catch (e) {
        Logger.log.error('Error occurred while checking for existing user:', e);
        return Promise.reject(e);
    }
};

/**
 * Helper function to fetch user list
 * @param {number} page - page number
 * @param {number} limit - limit number
 * @param {object} sortBy - sort direction
 * @returns {object}
 */
const listUsers = async ({ page = 1, limit = 15, sortBy = { name: 1 } }) => {
    try {
        const pipeline = [
            { $sort: sortBy },
            { $project: { _id: 1, name: 1, email: 1 } },
            {
                $facet: {
                    docs: [
                        {
                            $skip: (page - 1) * limit,
                        },
                        { $limit: limit },
                    ],
                    total: [
                        {
                            $count: 'count',
                        },
                    ],
                },
            },
        ];
        const users = await User.aggregate(pipeline).allowDiskUse(true);
        const total = users?.[0]?.['total']?.['count'] || 0;
        return {
            docs: users?.[0]?.['docs'] || [],
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    } catch (e) {
        Logger.log.error('Error occurred while getting users:', e);
        return Promise.reject(e);
    }
};

/**
 * Service Export
 */
module.exports = {
    checkForExistingUser,
    listUsers,
};
