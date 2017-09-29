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
            user: 'protector@astraler.com', // Your email id
            pass: 'a=Z5E>9g' // Your password
        }
    });

    var mailOptions = {
        from: 'protector@astraler.com', // sender address
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

    var search = req.query.search;
    delete req.query.search;
    if (search)
        query = {
            $or: [{
                email: {
                    $regex: search, $options: 'i'
                }
            }]
        };
    else query = {};
    Users.paginate(
        query,
        {
            page: Number(req.query.page),
            limit: Number(req.query.limit)
        },
        function (err, user) {
            if (err)
                return sendJSONresponse(res, 500, err);
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

module.exports.checkEmailExist = function (req, res) {
    Users.findOne({email: req.params.email}, function (err, user) {
        if (err)
            return sendJSONresponse(res, 500, {
                success: false,
                message: err
            });
        if (!user)
            return sendJSONresponse(res, 404, {
                success: false,
                message: 'Email is not exist'
            });
        sendJSONresponse(res, 200, {
            success: true,
            message: 'Successful! ',
            data: user.email
        })
    });
};

module.exports.login = function (req, res) {
    //  Validate Input
    req.checkBody('email', 'email value should be not empty').optional().notEmpty();
    req.checkBody('passCode', 'passCode value should be not empty').optional().notEmpty();

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            var error = result.useFirstErrorOnly().array()[0].msg;
            return res.status(400).json({
                success: false,
                message: error
            });
        }
        Users.findOne(
            {
                email: req.body.email
            },
            function (err, user) {
                if (err) {
                    res.status(500);
                    return res.send(err);
                }
                if (!user) {
                    res.status(401);
                    return res.send({success: false, message: 'User not Found'});
                }
                if (!user.validPassword(req.body.passCode)) {
                    res.status(401);
                    res.send({
                        success: false,
                        message: 'Wrong Passcode'
                    })
                }
                sendJSONresponse(res, 200, {
                    success: true,
                    message: 'Login successful!',
                    data: user
                });
            }
        );
    });
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

module.exports.verifyPassToken = function (req, res) {
    Users.findOne({email: req.body.email}, function (err, user) {
        if (err)
            return sendJSONresponse(res, 500, {
                success: false,
                message: err
            });
        if (!user)
            return sendJSONresponse(res, 404, {
                success: false,
                message: 'User not Found!'
            });
        if (req.body.passToken !== user.passToken)
            return sendJSONresponse(res, 400, {
                success: false,
                message: 'Invalid Pass Token'
            });
        var data = {
            email: user.email,
            passToken: user.passToken
        };
        sendJSONresponse(res, 200, {
            success: true,
            message: 'Verify successful! ',
            data: data
        })
    });
};

module.exports.resetPasscode = function (req, res) {
    //  Validate Input
    req.checkBody('passToken', 'passToken value should be not empty').optional().notEmpty();

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            var error = result.useFirstErrorOnly().array()[0].msg;
            return res.status(400).json({
                success: false,
                message: error
            });
        }
        Users.findOne({email: req.body.email}, function (err, user) {
            if (err)
                return sendJSONresponse(res, 400, err);
            if (!user)
                return sendJSONresponse(res, 404, {
                    success: false,
                    message: 'User not Found'
                });

            user.setPassword(req.body.passCode);
            user.passToken = "";
            user.save(function (err, user) {
                if (err)
                    return sendJSONresponse(res, 400, err);
                sendJSONresponse(res, 200, {
                    success: true,
                    message: 'Change passcode successful! '
                })
            })
        });
    });
};

module.exports.changePassCode = function (req, res) {
    Users.findOne({email: req.body.email}, function (err, user) {
        if (err)
            return sendJSONresponse(res, 500, {
                success: false,
                message: err
            });
        if (!user)
            return sendJSONresponse(res, 404, {
                success: false,
                message: 'User not Found'
            });
        if (req.body.newPassCode !== req.body.confirmPassCode)
            return sendJSONresponse(res, 400, {
                success: false,
                message: 'New passcode must be same as confirm passcode'
            });
        user.setPassword(req.body.newPassCode);
        user.save();
        sendJSONresponse(res, 200, {
            success: true,
            message: 'Change passcode successful! '
        });
    })
};

module.exports.deviceTokenPOST = function (req, res) {
    Users.findOne({email: req.body.email}, function (err, user) {
        if(err)
            return sendJSONresponse(res, 500, {
                success: false,
                message: err
            });
        if(!user)
            return sendJSONresponse(res, 404, {
                success: false,
                message: 'User not Found'
            });
        user.deviceToken = req.body.deviceToken;
        user.save(function (err, user) {
            if(err)
                return sendJSONresponse(res, 500, {
                    success:false,
                    message: err
                });
            return sendJSONresponse(res, 200, {
                success: true,
                message: 'Post device token successfull! ',
                data: user
            })
        });
    })
};
