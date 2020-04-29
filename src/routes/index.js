const express = require('express');
const router = express.Router();
const CONSTANTS = require('../config/constant');

/* GET home page. */
router.get('/health', function(req, res, next) {
  res.json({
    status: CONSTANTS.REQUEST_STATUSES.SUCCESSFUL,
    message: 'Payant service is in good condition 😀'
  })
});

module.exports = router;
