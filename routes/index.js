var express = require('express');
const usersRouter = require('./user');
var app = express()


app.use('/user', usersRouter);


module.exports = app;