/**
 * Created by yayayay on 30/06/2017.
 */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var activationsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passCode: {
        type: Number,
        require: true
    },
    validToken: String,
    isVerify: {
        type: Boolean,
        default: false
    },
    updateAt: Date,
    createAt: {
        type: Date,
        default: Date.now()
    },
});

activationsSchema.statics.deleteAnActivation = function (email, callback) {
    var query = {
        email: email
    };
    this.deleteOne(query).exec(callback);
};

activationsSchema.plugin(mongoosePaginate);
mongoose.model('Activations', activationsSchema);