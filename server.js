var express = require('express');
var app = express();
var config = require('./config');

app.use('/', express.static('public'));
app.listen(config.websitePort);