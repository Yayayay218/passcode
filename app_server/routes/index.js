var express = require('express');
var router = express.Router();

var ctrlActivation = require('../controllers/activation.controller');
var ctrlUser = require('../controllers/user.controller');

//  Activation APIs
router.get('/activations', ctrlActivation.activationGetAll);
router.post('/activations', ctrlActivation.activationPOST);
router.post('/activations/verify', ctrlActivation.activate);

//  User APIs
router.get('/users', ctrlUser.userGetAll);
router.post('/users/login', ctrlUser.login);
router.post('/users/forgotPasscode', ctrlUser.forgotPasscode);
router.put('/users/changePasscode', ctrlUser.newPasscode);

module.exports = router;
