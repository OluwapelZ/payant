const express = require('express');
const router = express.Router();
const CONSTANTS = require('../constants/constant');
const authMiddleware = require('../middleware/auth');
const BaseController = require('../controllers/base');
const baseController = new BaseController();

/* GET home page. */
router.get('/health', function(req, res, next) {
  res.json({
    status: CONSTANTS.REQUEST_STATUSES.SUCCESSFUL,
    message: 'Payant service is in good condition 😀'
  })
});

// Transact options
router.post('/transact/options', authMiddleware, baseController.listProviderProducts);

//Transact
router.post('/transact', authMiddleware, baseController.transact);

module.exports = router;
