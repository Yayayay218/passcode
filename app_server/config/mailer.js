var nodemailer = require('nodemailer');
var base64Url = require('base64url');

module.exports.mailConfig = function (req, res) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'bmcfurniture2017@gmail.com', // Your email id
            pass: 'hermann123' // Your password
        }
    });
    var text = 'Your confirmation code is '+ req.body.validToken;
    var email = req.body.email;

    var mailOptions = {
        from: 'bmcfurniture2017@gmail.com', // sender address
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

