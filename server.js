var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var config = require('./config');
var fs = require('fs');
var path = require('path');
var requestHelper = {};
var homeDirectory = config.homeDirectory || ".";
var requestHelper = require('./app/requestHelper')

app.use('/designer/', express.static(__dirname + '/public'));

io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']);
io.set('origins', '*:*');

io.sockets.on('connection', function(socket) {
  requestHelper.listen(socket);

  requestHelper.on('directory', function (request) {
    var deferred = this;

    fs.readdir(path.resolve(homeDirectory, '.' + request.path), function (err, files) {
      var result = {
        path: request.path,
        name: '',
        type: 'folder',
        children: []
      };

      if (err) {
        deferred.reject(err);
      } else {
        files.forEach(function (file) {
          result.children.push({
            path: path.resolve(request.path, file),
            name: file,
            type: 'file'
          });
        });
        deferred.resolve(result);
      }
    });
  });

  requestHelper.on('load', function (request) {
    var deferred = this;

    fs.readFile(path.resolve(homeDirectory, '.' + request.path), function (err, data) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(new Buffer(data, 'binary').toString('base64'));
      }
    });
  });

  requestHelper.on('save', function (file) {
    var deferred = this;

    fs.writeFile(file.name, new Buffer(file.content, 'base64').toString('binary'), function (err) {
      if (err) {
        console.log('File could not be saved.');
        deferred.reject(err);
      } else {
        console.log('File saved.');
        deferred.resolve({ message: 'File saved.' });
      };
    });
  });

});

server.listen(config.port);