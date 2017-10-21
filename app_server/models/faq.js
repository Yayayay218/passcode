/**
 * Created by yayayay on 30/06/2017.
 */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var faqSchema = new mongoose.Schema({
    question: String,
    answer: String,
    updateAt: Date,
    createAt: {
        type: Date,
        default: Date.now()
    }
});

faqSchema.plugin(mongoosePaginate);
mongoose.model('Faqs', faqSchema);