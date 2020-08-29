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
router.get('/', function(req, res, next) {
  res.json({
    status: CONSTANTS.REQUEST_STATUSES.SUCCESSFUL,
    message: 'Payant Microservice'
  })
});

//Transact
router.post('/buy_airtime', authMiddleware.authenticatePayantUser, baseController.buyAirtime);
router.post('/buy_data', authMiddleware.authenticatePayantUser, baseController.buyData);
router.post('/buy_scratch_card', authMiddleware.authenticatePayantUser, baseController.buyScratchCard);
router.post('/look_up_nin_min', baseController.lookupNinMin);
router.post('/look_up_nin_mid', baseController.lookupNinMid);
router.post('/pay_tv', authMiddleware.authenticatePayantUser, baseController.payTv);
router.post('/pay_electricity', authMiddleware.authenticatePayantUser, baseController.payElectricity);

module.exports = router;
