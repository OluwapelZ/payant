const express = require('express');
const router = express.Router();
const { getStatus } = require('../services/loan');

/* GET home page. */
router.get('/health', function(req, res, next) {
  res.json({
    status: true,
    message: 'Migo service is in good condition 😀'
  })
});

/* Get loan status */
router.post('/loans', getStatus);

module.exports = router;
