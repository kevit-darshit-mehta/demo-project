/**
 * System and 3rd party libs
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Logger = require('../services/logger');
const { checkForExistingUser } = require('../helper/user.helper');

/**
 * Router Definitions
 */

/**
 * User Registration
 */
router.post('/user-register', async (req, res) => {
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
        await user.save();
        return res.status(200).send({ message: 'User registered successfully' });
    } catch (err) {
        Logger.log.error('Error while creating user:' + err.message || err);
        res.status(500).send({
            message: e.message || 'Something went wrong, please try again later',
        });
    }
});

/**
 * Export Router
 */
module.exports = router;
