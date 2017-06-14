var mongoose = require('mongoose'), Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var autoIncre = require('mongoose-sequence');

var passCodesSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passCode: {
        type: String,
        require: true
    },
    // hash: String,
    // salt: String,
    isValid: {
        type: Boolean,
        default: false
    },
    validToken: String,
    updateAt: Date,
    createAt: {
        type: Date,
        default: Date.now()
    },
});

// passCodesSchema.methods.setPasscode = function (passcode) {
//     this.salt = crypto.randomBytes(16).toString('hex');
//     this.hash = crypto.pbkdf2Sync(passcode, this.salt, 1000, 64, 'sha1').toString('hex');
// };
//
// passCodesSchema.methods.validPasscode = function (passcode) {
//     var hash = crypto.pbkdf2Sync(passcode, this.salt, 1000, 64, 'sha1').toString('hex');
//     return this.hash === hash;
// };

passCodesSchema.plugin(mongoosePaginate);
passCodesSchema.plugin(autoIncre, {inc_field: 'passCode_id'});
mongoose.model('PassCodes', passCodesSchema);