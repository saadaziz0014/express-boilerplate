var express = require('express');
const usersRouter = require('./user');
var app = express()
var Authentication = require('../../middleware/jwt-auth');


app.use('/user', Authentication.checkAuthAdmin, usersRouter);

module.exports = app;