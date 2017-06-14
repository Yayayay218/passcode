var express = require('express');
var router = express.Router();

var ctrlPassCode = require('../controllers/passCode.controller');

//  Passcode APIs
router.get('/passcode', ctrlPassCode.passCodeGetAll);
router.post('/passcode', ctrlPassCode.passCodePost);
router.put('/validPasscode', ctrlPassCode.activate);
router.post('/forgotPasscode', ctrlPassCode.forgotPasscode);

module.exports = router;
