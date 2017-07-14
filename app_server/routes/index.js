var express = require('express');
var router = express.Router();

var ctrlActivation = require('../controllers/activation.controller');
var ctrlUser = require('../controllers/user.controller');
var ctrlNotification = require('../controllers/notification.controller');

//  Activation APIs
router.get('/activations', ctrlActivation.activationGetAll);
router.post('/activations', ctrlActivation.activationPOST);
router.post('/activations/verify', ctrlActivation.activate);

//  User APIs
router.get('/users', ctrlUser.userGetAll);
router.post('/users/login', ctrlUser.login);
router.post('/users/forgotPasscode', ctrlUser.forgotPasscode);
router.post('/users/verifyPassToken', ctrlUser.verifyPassToken);
router.put('/users/resetPasscode', ctrlUser.resetPasscode);
router.put('/users/changePasscode', ctrlUser.changePassCode);
router.post('/users/deviceToken', ctrlUser.deviceTokenPOST);

//  Email exist
router.get('/:email', ctrlUser.checkEmailExist);

//  Notification
router.post('/notifications', ctrlNotification.pushNotification);

module.exports = router;
