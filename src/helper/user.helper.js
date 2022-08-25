/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const User = mongoose.model('user');

/**
 * Services
 */
const Logger = require('../services/logger');

/**
 * Declarations & Implementations
 */
const userJson = require('./../../seed/user.json');
const courseJson = require('./../../seed/course.json');

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
const listUsers = async ({ page = 1, limit = 15, sortBy = 'name', sortType = 1 }) => {
    try {
        page = parseInt(page);
        limit = parseInt(limit);
        const sort = {};
        sort[sortBy] = parseInt(sortType);
        const pipeline = [
            { $sort: sort },
            { $project: { _id: 1, name: 1, email: 1, course: 1 } },
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
        const total = users?.[0]?.['total']?.[0]?.['count'] || 0;
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
 * Add data in the database table
 */
const seedData = async () => {
    try {
        await seedUsers();
    } catch (e) {
        console.log('Error in creating Tables:', e);
    }
};

/**
 * Add user data to the database
 */
const seedUsers = async () => {
    const users = await User.find({}).lean();
    for (let i = 0; i < userJson.length; i++) {
        if (!users.find((u) => u.email === userJson[i].email)) {
            userJson[i].course = await seedCourse();
            await User.create(userJson[i]);
        }
    }
    Logger.log.info('Users seeded successfully.');
};

/**
 * Helper function to generate random number
 * @param min - minimum number to generate
 * @param max - maximum number to generate
 * @returns {number}
 */
const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

/**
 * Helper function to pick random numbers courses
 */
const seedCourse = async () => {
    try {
        const randomNumber = await getRandomNumber(1, 8);
        const courses = [];
        for (let i = 0; i < randomNumber; i++) {
            courses.push(courseJson[Math.floor(Math.random() * courseJson.length)]);
        }
        return courses;
    } catch (e) {
        Logger.log.error('Error occurred while picking random number course:', e);
        return Promise.reject(e);
    }
};

/**
 * Calling this function to seed users data
 */
seedData();

/**
 * Service Export
 */
module.exports = {
    checkForExistingUser,
    listUsers,
};
