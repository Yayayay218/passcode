var nodemailer = require('nodemailer');
var base64Url = require('base64url');

module.exports.mailConfig = function (req, res) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'protector@astraler.com', // Your email id
            pass: 'a=Z5E>9g' // Your password
        }
    });
    var text = 'Your confirmation code is '+ req.body.validToken;
    var email = req.body.email;

    var mailOptions = {
        from: 'protector@astraler.com', // sender address
        to: email, // list of receivers
        subject: 'Customer Service', // Subject line
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

