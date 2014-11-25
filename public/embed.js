angular.module('ramlEditorApp')
  .factory('ApiDesignerRepository', function($q, config, eventService) {
    var service = {};

    service.directory = function(path) {
      var deferred = $q.defer();
      // Your magic goes here:
      // Do deferred.resolve(data); to fulfull the promise or
      // deferred.reject(error); to reject it.

      return deferred.promise;
    };

    service.load = function(path, name) {
      var deferred = $q.defer();
      // Your magic goes here:
      // Do deferred.resolve(data); to fulfull the promise or
      // deferred.reject(error); to reject it.

      return deferred.promise;
    };

    service.remove = function(path, name) {
      var deferred = $q.defer();
      // Your magic goes here:
      // Do deferred.resolve(data); to fulfull the promise or
      // deferred.reject(error); to reject it.

      return deferred.promise;
    };

    service.save = function(path, name, contents) {
      var deferred = $q.defer();
      // Your magic goes here:
      // Do deferred.resolve(data); to fulfull the promise or
      // deferred.reject(error); to reject it.

      return deferred.promise;
    };

    return service;
  })
  .run(function(ApiDesignerRepository, config, eventService) {
    config.set('fsFactory', 'ApiDesignerRepository');
  });