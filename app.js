var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');
var settings = require('./settings');
var flash = require('connect-flash');
var users = require('./routes/users');
var multer  = require('multer');
var app = express();

// view engine setup
app.use(multer({
    dest: './public/images',
    rename: function (fieldname, filename) {
        return filename;
    }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(flash());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: settings.cookieSecret,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30
    }, //30 days
    store: new MongoStore({
        url: settings.url,
        ttl: 60 * 60 * 24 * 30
    })
}));
routes(app);
module.exports = app;
