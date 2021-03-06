/**
 * Created by yayayay on 30/06/2017.
 */
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var randomstring = require('randomstring');
var nodemailer = require('nodemailer');
var sparkPostTransport = require('nodemailer-sparkpost-transport');
var fs = require("fs");
var ejs = require("ejs");

var Users = mongoose.model('Users');
var Activations = mongoose.model('Activations');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

var checkEmailExist = function (email) {
    return new Promise(function (resolve, reject) {
        Users.findOne({email: email}, function (err, user) {
            if (err) {
                reject(err);
            }
            resolve(user);
        });
    });
};

var sendEmail = function (res, text, email, subject, html) {
    // var transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 587,
    //     secure: false, // upgrade later with STARTTLS
    //     auth: {
    //         user: 'protector@astraler.com', // Your email id
    //         pass: 'a=Z5E>9g' // Your password
    //     }
    // });
    var transporter = nodemailer.createTransport(sparkPostTransport({
        sparkPostApiKey: 'b83d41344bfa22d6a089a93c19bd8364b7c3ce42'
    }));

    var mailOptions = {
        from: 'support@getprotector.com', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: text,//, // plaintext body,
        html: html
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
//  POST a activation
module.exports.activationPOST = function (req, res) {
    req.body.validToken = randomstring.generate(4);
    var data = req.body;

    //  Validate input
    req.checkBody('email', 'email value should be not empty').optional().notEmpty();
    req.checkBody('passCode', 'passcode value should be not empty').optional().notEmpty();
    req.checkBody('passCode', 'passcode value must be number').optional().isInt();

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            var error = result.useFirstErrorOnly().array()[0].msg;
            return res.status(400).json({
                success: false,
                message: error
            });
        }
        checkEmailExist(req.body.email)
            .then(function (data) {
                if (data.email === req.body.email)
                    return sendJSONresponse(res, 400, {
                        success: false,
                        message: 'Email has already exist! '
                    });
            })
            .catch(function (err) {
                Activations.findOneAndUpdate({email: req.body.email}, data, {'new': true}, function (err, activation) {
                    if (err)
                        return sendJSONresponse(res, 500, {
                            success: false,
                            message: err
                        });
                    if (activation) {
                        ejs.renderFile(__dirname + "/email_template/activation.ejs", {passcode: req.body.validToken}, function (err, data) {
                            if (err)
                                console.log(err)
                            var _text = 'Hello, We just need to verify ' +
                                'your email address to complete your ' +
                                'Protector signup. ' + '<b>' + req.body.validToken + '</b>';
                            var _html = data
                            var _subject = 'Please confirm your email address for your Protector account';
                            var _email = activation.email;
                            sendEmail(res, _text, _email, _subject, _html);
                            return sendJSONresponse(res, 201, {'data': activation});
                        })
                    }
                    var activation = new Activations(data);
                    ejs.renderFile(__dirname + "/email_template/activation.ejs", {passcode: req.body.validToken}, function (err, data) {
                        if (err)
                            console.log(err)
                        var text = 'Hello, We just need to verify ' +
                            'your email address to complete your ' +
                            'Protector signup. <b>' + req.body.validToken + '</b>';
                        var html = data
                        var subject = 'Please confirm your email address for your Protector account';
                        var email = req.body.email;
                        activation.save(function (err, activation) {
                            if (err)
                                return sendJSONresponse(res, 400, err);
                            sendEmail(res, text, email, subject, html);
                            return sendJSONresponse(res, 201, {'data': activation});
                        })
                    })
                });
            });
    });
};

//  POST a confirmation code
module.exports.activate = function (req, res) {
    var data = req.body;
    //  Validate
    req.checkBody('email', 'email value should be not empty').optional().notEmpty();
    req.checkBody('passCode', 'passcode value should be not empty').optional().notEmpty();

    Activations.findOneAndUpdate({email: req.body.email}, data, {'new': true}, function (err, activation) {
        if (err)
            sendJSONresponse(res, 400, err);

        else {
            if (activation && activation.validToken === req.body.confirmCode) {
                var data = {
                    email: activation.email,
                };
                var user = new Users(data);
                user.setPassword(activation.passCode);

                Activations.deleteAnActivation(activation.email, function (err) {
                    if (err)
                        sendJSONresponse(res, 400, err);
                });
                ejs.renderFile(__dirname + "/email_template/welcome.ejs", {passcode: req.body.passToken}, function (err, data) {
                    if(err)
                        console.log(err)
                    var text = ''
                    var html = data
                    var subject = 'Welcome to ' + req.body.email + '! Let’s get started';
                    var email = req.body.email;
                    user.save(function (err, user) {
                        if (err)
                            return sendJSONresponse(res, 400, err);
                        sendEmail(res, text, email, subject, html);
                        return sendJSONresponse(res, 201, user);
                    });
                })

                // return;
            }
            else
                return sendJSONresponse(res, 400, {'message': 'Wrong Valid '});
        }
    })
};

//  GET all activation
module.exports.activationGetAll = function (req, res) {
    var query = req.query || {};

    const page = Number(req.query.page);
    delete req.query.page;
    const limit = Number(req.query.limit);
    delete req.query.limit;
    const sort = req.query.sort;
    delete req.query.sort;
    const search = req.query.search;
    delete req.query.search;
    if (search)
        query = {
            $or: [{
                email: {$regex: search, $options: 'i'}
            }]
        };

    Activations.paginate(
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

