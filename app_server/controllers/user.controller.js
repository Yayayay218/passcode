/**
 * Created by yayayay on 30/06/2017.
 */
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var nodemailer = require('nodemailer');

var Users = mongoose.model('Users');
var Activations = mongoose.model('Activations');
var randomString = require('randomstring');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var sendEmail = function (res, text, email, subject) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'bmcfurniture2017@gmail.com', // Your email id
            pass: 'hermann123' // Your password
        }
    });

    var mailOptions = {
        from: 'bmcfurniture2017@gmail.com', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: text //, // plaintext body,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.json({yo: 'error'});
        } else {
            console.log('Message sent: ' + info.response);
            res.json({yo: info.response});
        }
    });
};

module.exports.userGetAll = function (req, res) {
    var query = req.query || {};

    Users.paginate(
        {},
        {
            page: Number(req.query.page),
            limit: Number(req.query.limit)
        },
        function (err, user) {
            if (err)
                return sendJSONresponse(res, 400, err);
            var results = {
                data: user.docs,
                total: user.total,
                limit: user.limit,
                page: user.page,
                pages: user.pages
            };
            sendJSONresponse(res, 200, results);
        }
    )
};

module.exports.login = function (req, res) {
    Users.findOne(
        {
            email: req.body.email
        },
        function (err, user) {
            if (err) {
                sendJSONresponse(res, 400, err);
                return;
            }
            if (!user) {
                sendJSONresponse(res, 404, {
                    success: false,
                    message: 'Email not founded'
                });
                return;
            }
            if (!user.validPassword(req.body.passCode))
                return sendJSONresponse(res, 400,
                    {
                        success: false,
                        message: 'Passcode is wrong'
                    });
            sendJSONresponse(res, 200, {
                success: true,
                message: 'Login successful!',
                data: user
            });
        }
    );
};

module.exports.forgotPasscode = function (req, res) {
    req.body.passToken = randomString.generate(4);

    Users.findOne({email: req.body.email}, function (err, user) {
        if (err)
            return sendJSONresponse(res, 400, err);
        if (!user)
            return sendJSONresponse(res, 404, {
                success: false,
                message: 'Email not Found'
            });
        var _text = 'Your verification code is ' + req.body.passToken;
        var _subject = 'Forgot Pass Code';
        var _email = user.email;
        sendEmail(res, _text, _email, _subject);

        user.passToken = req.body.passToken;
        user.save();
        sendJSONresponse(res, 200, {
            success: true,
            message: 'Successful!   '
        })
    });
};

module.exports.newPasscode = function (req, res) {
    Users.findOne({email: req.body.email}, function (err, user) {
        if (err)
            return sendJSONresponse(res, 400, err);
        if(!user)
            return sendJSONresponse(res, 404, {
                success: false,
                message: 'User not Found'
            });
        if(req.body.passToken !== user.passToken)
            return sendJSONresponse(res, 400, {
                success: false,
                message: 'Invalid verification code'
            });
        user.setPassword(req.body.passCode);
        user.passToken = "";
        user.save(function (err, user) {
            if(err)
                return sendJSONresponse(res, 400, err);
            sendJSONresponse(res, 200, {
                success: true,
                message: 'Change passcode successful! '
            })
        })
    });
};
