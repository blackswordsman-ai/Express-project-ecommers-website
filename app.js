var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var contactUsRouter = require('./routes/contact-us'); // import for contact us
const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts');
var productsRouter = require('./routes/products');
var apiRouter = require('./routes/api');
// const productAjax = require('./routes/productAjax');

var app = express();
//import the express-session
const session = require('express-session');

// session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//layout setup
app.use(expressLayouts);
app.set('layout', 'layouts/main-layout');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use('/contactus', contactUsRouter)//new routes for contact us
app.use('/products', productsRouter); 
app.use('/api', apiRouter);
// app.use('productAjax',productAjax);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;