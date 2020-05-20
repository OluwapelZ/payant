const express = require('express');
const router = express.Router();
const CONSTANTS = require('../config/constant');
const BaseService = require('../services/base_service')
const authMiddleware = require('../middleware/auth');
const baseService = new BaseService();

/* GET home page. */
router.get('/health', function(req, res, next) {
  res.json({
    status: CONSTANTS.REQUEST_STATUSES.SUCCESSFUL,
    message: 'Payant service is in good condition 😀'
  })
});

// Transact options
router.post('/transact/options', authMiddleware, baseService.listProviderServices);

module.exports = router;
