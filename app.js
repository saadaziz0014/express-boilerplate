var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cron = require('node-cron');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
require('dotenv').config();

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/admin', adminRouter);

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

const uri = "mongodb://0.0.0.0:27017/test";
  mongoose.set("strictQuery", false);
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log("MongoDB Connected"))
  .catch((error) => console.log(error.message));

cron.schedule('0 0 * * *', async () => {
  console.log('Every day at 12:00 am');
}, {
  scheduled: false
});


module.exports = app;
