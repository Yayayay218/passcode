/**
 * Created by yayayay on 30/06/2017.
 */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var crypto = require('crypto');

var usersSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    hash: String,
    salt: String,
    passToken: String,
    updateAt: Date,
    createAt: {
        type: Date,
        default: Date.now()
    }
});

usersSchema.methods.setPassword = function (password) {
    password = password.toString();
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

usersSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password.toString(), this.salt, 1000, 64, 'sha1').toString('hex');
    return this.hash === hash;
};

usersSchema.plugin(mongoosePaginate);
mongoose.model('Users', usersSchema);