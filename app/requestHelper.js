var q = require('q');
var requestHelper = {};

function asPromise (handler, payload) {
  var deferred = q.defer();

  handler.bind(deferred)(payload);
  return deferred.promise;
}

requestHelper.listen = function (socket) {
  this.socket = socket;
};

requestHelper.on = function (operation, handler) {
  var _this = this;
  this.socket.on(operation, function (payload) {
    asPromise(handler, payload).then(
      function (response) {
        _this.socket.emit(operation + '.response', response);
      }, function (error) {
        _this.socket.emit(operation + '.error', error);
      });
  });
};

module.exports = requestHelper;