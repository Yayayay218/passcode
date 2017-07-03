/**
 * Created by yayayay on 30/06/2017.
 */
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var randomstring = require('randomstring');
var nodemailer = require('nodemailer');

var Users = mongoose.model('Users');
var Activations = mongoose.model('Activations');

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
//  POST a activation
module.exports.activationPOST = function (req, res) {
    req.body.validToken = randomstring.generate(4);

    var data = req.body;
    Activations.findOneAndUpdate({email: req.body.email}, data, {'new': true}, function (err, activation) {
        if (err)
            sendJSONresponse(res, 400, err);
        else if (activation) {
            var _text = 'Your confirmation code is ' + req.body.validToken;
            var _subject = 'Activation Code';
            var _email = activation.email;
            sendEmail(res, _text, _email, _subject);
            sendJSONresponse(res, 201, {'data': activation});
        }
        else {
            var activation = new Activations(data);

            var text = 'Your confirmation code is ' + req.body.validToken;
            var subject = 'Activation Code';
            var email = req.body.email;
            activation.save(function (err, activation) {
                if (err)
                    sendJSONresponse(res, 400, err);
                else {
                    sendEmail(res, text, email, subject);
                    sendJSONresponse(res, 201, {'data': activation});
                }
            })
        }
    });

};

//  POST a confirmation code
module.exports.activate = function (req, res) {
    req.body.isVerify = true;
    var data = req.body;
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
                    if(err)
                        sendJSONresponse(res, 400, err);
                });

                user.save(function (err, user) {
                    if (err)
                        return sendJSONresponse(res, 400, err);
                    sendJSONresponse(res, 201, user);
                });
                return;
            }
            sendJSONresponse(res, 404, {'message': 'Wrong Valid '});
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

