var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var randomstring = require('randomstring');
var nodemailer = require('nodemailer');
var PassCodes = mongoose.model('PassCodes');

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
//  POST a passcode
module.exports.passCodePost = function (req, res) {
    req.body.validToken = randomstring.generate(7);
    var data = req.body;
    PassCodes.findOneAndUpdate({email: req.body.email}, data, function (err, passcode) {
        if (err)
            sendJSONresponse(res, 400, err);
        else if (passcode) {
            var _text = 'Your confirmation code is ' + req.body.validToken;
            var _subject = 'Activation Code';
            var _email = passcode.email;
            sendEmail(res, _text, _email, _subject);
            sendJSONresponse(res, 201, {'data': passcode})
        }
        else {
            var passCode = new PassCodes(data);
            // passcode.setPasscode(req.body.passCode);
            var text = 'Your confirmation code is ' + req.body.validToken;
            var subject = 'Activation Code';
            var email = req.body.email;
            passCode.save(function (err, passCode) {
                if (err)
                    sendJSONresponse(res, 400, err);
                else {
                    sendEmail(res, text, email, subject);
                    sendJSONresponse(res, 201, {'data': passCode});
                }
            })
        }
    });

};

//  POST a confirmation code
module.exports.activate = function (req, res) {
    req.body.isValid = true;
    var data = req.body;
    PassCodes.findOneAndUpdate({email: req.body.email}, data, function (err, passcode) {
        if (err)
            sendJSONresponse(res, 400, err);
        else {
            if (passcode && passcode.validToken === req.body.confirmCode)
                sendJSONresponse(res, 201, {'data': passcode});
            else
                sendJSONresponse(res, 404, {'message': 'Wrong Valid '});
        }
    })
};

//  Forgot Passcode
module.exports.forgotPasscode = function (req, res) {
    PassCodes.findOne({email: req.body.email}, function (err, passcode) {
        if (err)
            sendJSONresponse(res, 400, err);
        else {
            if (passcode) {
                var text = 'Your PassCode is ' + passcode.passCode;
                var email = passcode.email;
                var subject = 'Provide Passcode';
                sendEmail(res, text, email, subject);
            }
            else
                sendJSONresponse(res, 404, {'message': 'Not Found'});

        }
    })
};

//  GET all passcode
module.exports.passCodeGetAll = function (req, res) {
    var query = req.query || {};

    const page = Number(req.query.page);
    delete req.query.page;
    const limit = Number(req.query.limit);
    delete req.query.limit;
    const sort = req.query.sort;
    delete req.query.sort;
    const search = req.query.search;
    delete req.query.search;

    if (search) {
        PassCodes.paginate({
                $or: [{
                    email: {$regex: search, $options: 'i'}
                }]
            }, {
                page: page,
                limit: limit
            },

            function (err, category) {
                if (err)
                    sendJSONresponse(res, 404, err);
                else {
                    var results = {
                        data: category.docs,
                        total: category.total,
                        limit: category.limit,
                        page: category.page,
                        pages: category.pages
                    };
                    sendJSONresponse(res, 200, results);
                }
            })
    } else
        PassCodes.paginate(
            query,
            {
                sort: sort,
                page: page,
                limit: limit
            },
            function (err, category) {
                if (err)
                    sendJSONresponse(res, 404, err);
                else {
                    var results = {
                        data: category.docs,
                        total: category.total,
                        limit: category.limit,
                        page: category.page,
                        pages: category.pages
                    };
                    sendJSONresponse(res, 200, results);
                }
            })
};

