const express = require("express");

const welfare = require('../controllers/welfare.controller');

let { checkToken } = require('../utils/middleware.js');

const router = express.Router();

router.route('/').get(checkToken, welfare.getRequests);
router.route('/').post(checkToken, welfare.createRequest);
router.route('/:id').post(checkToken, welfare.acceptRequest);

module.exports = router;