var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var HTTPStatus = require('../../helpers/lib/http_status');

var Faqs = mongoose.model('Faqs');

var sendJSONResponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

//  Config upload photo
var multer = require('multer');

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, 'uploads/faq')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});
var upload = multer({
    storage: storage
}).single('file');

//  POST a faq
module.exports.faqPOST = function (req, res) {

    var data = req.body;
    var faq = new Faqs(data);
    faq.save(function (err, faq) {
        if (err)
            return sendJSONResponse(res, HTTPStatus.BAD_REQUEST, {
                success: false,
                message: err
            });

        return sendJSONResponse(res, HTTPStatus.CREATED, {
            success: true,
            message: "Add a new faq successful!",
            data: faq
        })
    })
};

//  GET all Faqs
module.exports.faqGetAll = function (req, res) {
    var query = req.query || {};
    const id = req.query.id;
    delete req.query.id;
    if (id)
        query = {
            "_id": {$in: id}
        };
    else
        query = {};
    Faqs.paginate(
        query,
        {
            sort: req.query.sort,
            page: Number(req.query.page),
            limit: Number(req.query.limit)
        }, function (err, faq) {
            if (err)
                return sendJSONResponse(res, HTTPStatus.BAD_REQUEST, {
                    success: false,
                    message: err
                });
            var results = {
                data: faq.docs,
                total: faq.total,
                limit: faq.limit,
                page: faq.page,
                pages: faq.pages
            };
            return sendJSONResponse(res, HTTPStatus.OK, results);
        }
    )
};
module.exports.faqGetOne = function (req, res) {
    Faqs.findById(req.params.id, function (err, faq) {
        if (err)
            return sendJSONResponse(res, HTTPStatus.BAD_REQUEST, {
                success: false,
                message: err
            });
        if (!faq)
            return sendJSONResponse(res, HTTPStatus.NOT_FOUND, {
                success: false,
                message: 'faq not founded'
            })
        return sendJSONResponse(res, HTTPStatus.OK, {
            success: true,
            data: faq
        })
    })
};

//  DEL a faqz
module.exports.faqDEL = function (req, res) {
    if (req.params.id)
        Faqs.findByIdAndRemove(req.params.id, function (err) {
            if (err)
                return sendJSONResponse(res, HTTPStatus.NOT_FOUND, {
                    success: false,
                    message: err
                });
            return sendJSONResponse(res, HTTPStatus.NO_CONTENT, {
                success: true,
                message: 'faq was deleted'
            })
        });
};

//  PUT a faq
module.exports.faqPUT = function (req, res) {
    req.body.updatedAt = Date.now();

    upload(req, res, function (err) {
        if (err)
            return sendJSONResponse(res, HTTPStatus.BAD_REQUEST, {
                success: false,
                message: err
            });
        req.body.slug = slug(req.body.title);
        var data = req.body;
        Faqs.findByIdAndUpdate(req.params.id, data, {'new': true}, function (err, faq) {
            if (err)
                return sendJSONResponse(res, HTTPStatus.BAD_REQUEST, {
                    success: false,
                    message: err
                });
            if (!faq)
                return sendJSONResponse(res, HTTPStatus.NOT_FOUND, {
                    success: false,
                    message: "faq's not founded"
                });
            return sendJSONResponse(res, HTTPStatus.OK, {
                success: true,
                message: 'Update faq successful!',
                data: faq
            })
        })
    });

};
