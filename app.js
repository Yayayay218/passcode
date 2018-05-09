var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var paginate = require('express-paginate');
var swaggerUi = require('swagger-ui-express');
var axios = require('axios')
var JsonRefs = require('json-refs');
var YAML = require('js-yaml');
var cors = require('cors'); // call the cors to fix access control bug.

//Bring the data model
require('./app_server/models/db');

app.use(cors());

var routesApi = require('./app_server/routes/index');

app.use(paginate.middleware(10, 50)); // limit=10,  maxLimit=50

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));

app.use(express.static(path.join(__dirname, 'node_modules/swagger-ui-express/static')));
app.use(express.static(path.join(__dirname, 'protector-frontend')));

app.use(express.static(path.join(__dirname, 'public')));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.get('/pages/base.html', function (req, res) {
    axios.get('http://astraler.com/turbodl/turbodlwebview.json')
        .then(docs => {
            let token = jwt.sign({
                data: 'foobar'
            }, '3340e18c-baba-4b7b-bb6c-d1f17dc7d8b8', {expiresIn: '3h'});
            res.render('base', {
                link: 'https://videodl.net?token=' + token,
                webview: docs.data.webviewnumber
            })
        })
        .catch(err => {
            let token = jwt.sign({
                data: 'foobar'
            }, '3340e18c-baba-4b7b-bb6c-d1f17dc7d8b8', {expiresIn: '3h'});
            res.render('base', {
                link: 'https://videodl.net?token=' + token,
                webview: 2
            })
        })
});
app.use('/photovault/api', routesApi);

var optionsRef = {
    filter: ['relative', 'remote'],
    loaderOptions: {
        processContent: function (res, cb) {
            cb(undefined, YAML.safeLoad(res.text));
        }
    }
};

JsonRefs.resolveRefsAt('./swagger/index.yaml', optionsRef).then(function (results) {
    // console.log(results.resolved);
    // console.log("================refs ",results.refs);
    app.get('/api-docs', swaggerUi.serve, swaggerUi.setup(results.resolved));
}, function (err) {
    console.log(err.stack);
});

module.exports = app;
