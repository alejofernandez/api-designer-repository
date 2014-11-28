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
    var operationId = payload.__operationId;
    asPromise(handler, payload).then(
      function (response) {
        if (typeof response === 'string') {
          response = { __response: response };
        }
        response.__operationId = operationId;
        _this.socket.emit(operation + '.response', response);
      }, function (error) {
        if (typeof error === 'string') {
          error = { __error: error };
        }
        error.__operationId = operationId;
        _this.socket.emit(operation + '.error', error);
      });
  });
};

module.exports = requestHelper;