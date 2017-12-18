/**
 * Created by yayayay on 06/07/2017.
 */
var apn = require('apn');
var cfgNotification = require('../config/notification');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Users = mongoose.model('Users');

var sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.pushNotification = function (req, res) {
    var data = req.body;
    if (process.env.NODE_ENV === 'production')
        var apnProvider = new apn.Provider(cfgNotification.PRD_OPTS);
    else
        var apnProvider = new apn.Provider(cfgNotification.DEV_OPTS);
    Users.find(function (err, user) {
        if (err)
            sendJSONResponse(res, 500, {
                success: false,
                message: err
            })
        user.forEach((user) => {
            var note = new apn.Notification();
//  Notification Content
            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = 1;
            note.sound = "default";
            // note.alert = "\uD83D\uDCE7 \u2709 " + data.alert;
            note.title = data.title;
            note.body = data.text;
            note.payload = {
                'messageFrom': 'Protector Admin',
                'notificationType': data.notificationType,
                'notificationLink': data.notificationLink
            };

            apnProvider.send(note, user.deviceToken).then(function (result) {
                // sendJSONResponse(res, 200, {
                //     sent: result.sent.length,
                //     failed: result.failed.length,
                //     fail: result.failed
                // })
                console.log("sent:", result.sent.length);
                console.log("failed:", result.failed.length);
                console.log(result.failed);
            });
        });
    });
    // let deviceToken = '43b7129e1fdd950bdd01f95ed118dbd5699df27facc09653d4cc007b50fda746';

    apnProvider.shutdown();
};

