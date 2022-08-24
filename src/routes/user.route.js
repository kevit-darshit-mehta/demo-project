/**
 * System and 3rd party libs
 */
const express = require('express');
const router = express.Router();
const Logger = require('../services/logger');
const { listUsers } = require('../helper/user.helper');

/**
 * Router Definitions
 */

/**
 *
 */
router.get('/', async (req, res) => {
    try {
        const userDocuments = await listUsers({ page: req.query.page, limit: req.query.limit });
        return res.status(200).send({ message: 'Users fetched successfully', data: userDocuments });
    } catch (err) {
        Logger.log.error('Error occurred while getting users:', err);
        res.status(500).send({
            message: err.message,
        });
    }
});

/**
 * Export Router
 */
module.exports = router;
