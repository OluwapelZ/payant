const createError = require('http-errors');
const express = require('express');
const morgan = require('morgan');
const logger = require('./utils/logger');
const redact =
require('dotenv').config();

const router = require('./routes/index');

const app = express();


app.use(morgan('dev', {stream: logger.stream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Setup api logger to intercept response
app.use(require('./middleware/api_logger'));

//Bind router-level middleware to app
app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //Include winston error
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

  // render the error page
  res.status(err.status || 500);
  res.send('INTERNAL SERVER ERROR');
});

module.exports = app;
