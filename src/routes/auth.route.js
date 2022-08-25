/**
 * System and 3rd party libs
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Logger = require('../services/logger');
const { checkForExistingUser } = require('../helper/user.helper');
const initializePassport = require('../passport-config');
const config = require('../../config');
let users = [];

/**
 * Router Definitions
 */
router.use(flash());
router.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
    }),
);
router.use(passport.initialize());
router.use(passport.session());

/**
 * Function to fetch users from database + Initializing passport
 */
async function addUsers() {
    users = await User.find().select('id name email password').lean();
    initializePassport(
        passport,
        (email) => users.find((user) => user.email === email),
        (id) => users.find((user) => user.id === id),
    );
}

/**
 * Calling this function to store user's details to global session from database
 */
addUsers();

/**
 * User Registration
 */
router.post('/register', async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).send({
            message: 'Required details are missing',
        });
    }
    try {
        const isUserExist = await checkForExistingUser({ email: req.body.email });
        if (isUserExist) {
            return res.status(400).send({
                message: 'User already exists',
            });
        }
        const user = new User(req.body);
        user.id = Date.now();
        await user.save();
        users.push(JSON.parse(JSON.stringify(user)));
        return res.status(200).send({ message: 'User registered successfully' });
    } catch (err) {
        Logger.log.error('Error while creating user:' + err.message || err);
        res.status(500).send({
            message: e.message || 'Something went wrong, please try again later',
        });
    }
});

/**
 * API to Login User
 */
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {}), async (req, res) => {
    try {
        res.status(200).send({ message: 'User logged in successfully' });
    } catch (err) {
        console.log(err);
    }
});

/**
 * Middleware to authenticate user
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {*} next - application's request-response cycle
 * @returns
 */
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

/**
 * Export Router
 */
module.exports = router;
