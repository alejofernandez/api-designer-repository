angular.module('ramlEditorApp')
  .constant('LOCAL_PERSISTENCE_KEY','localStorageFilePersistence2')
  .constant('FOLDER', 'folder')
  .factory('remoteStorage', function ($rootScope, $q, SERVER) {
    var service = {},
        socket = io(SERVER || 'http://localhost:8080'),
        connected = false;

    socket.on('connect', function () {
      $rootScope.$apply(function () {
        connected = true;
      });
    });

    socket.on('disconnect', function () {
      $rootScope.$apply(function () {
        connected = false;
      });
    });

    service.isConnected = function () {
      return connected;
    };

    service.invoke = function (operation, payload, callback, errorCallback) {
      var deferred = $q.defer();

      callback = callback || function (data) {
        this.resolve(data);
      };

      errorCallback = errorCallback || function (error) {
        this.reject(error);
      };

      socket.on(operation + '.response', callback.bind(deferred));
      socket.on(operation + '.error', errorCallback.bind(deferred));
      socket.emit(operation, payload);

      return deferred.promise;
    };

    service.on = function (eventName, callback) {
      delivery.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(delivery, args);
        });
      });
    };

    return service;
  })
  .factory('ApiDesignerRepository', function ($q, $timeout, remoteStorage, localStorageHelper, FOLDER) {
    function fileNotFoundMessage(path) {
      return 'file with path="' + path + '" does not exist';
    }

    function addChildren(entry, fn) {
      if (entry.type === FOLDER) {
        entry.children = fn(entry.path);
      }
    }
    function findFolder(path) {
      var entries = [];
      localStorageHelper.forEach(function (entry) {
        if (entry.path.toLowerCase() === path.toLowerCase()) {
          addChildren(entry, findFiles);
          entries.push(entry);
        }
      });
      return entries.length > 0 ? entries[0] : null;
    }
    function findFiles(path) {
      if (path.lastIndexOf('/') !== path.length - 1) {
        path += '/';
      }

      var entries = [];
      localStorageHelper.forEach(function (entry) {
        if (entry.path.toLowerCase() !== path.toLowerCase() &&
            extractParentPath(entry.path) + '/' === path) {
          addChildren(entry, findFiles);
          entries.push(entry);
        }
      });
      return entries;
    }

    /**
     *
     * Save in localStorage entries.
     *
     * File structure are objects that contain the following attributes:
     * * path: The full path (including the filename).
     * * content: The content of the file (only valid for files).
     * * isFolder: A flag that indicates whether is a folder or file.
     */
    var service = {};
    var delay   = 500;

    service.supportsFolders = false ;

    function validatePath(path) {
      if (path.indexOf('/') !== 0) {
        return {valid: false, reason: 'Path should start with "/"'};
      }
      return {valid: true};
    }

    function extractNameFromPath(path) {
      var pathInfo = validatePath(path);

      if (!pathInfo.valid) {
        throw 'Invalid Path!';
      }

      // When the path is ended in '/'
      if (path.lastIndexOf('/') === path.length - 1) {
        path = path.slice(0, -1);
      }

      return path.slice(path.lastIndexOf('/') + 1);
    }

    function extractParentPath(path) {
      var pathInfo = validatePath(path);

      if (!pathInfo.valid) {
        throw 'Invalid Path!';
      }

      // When the path is ended in '/'
      if (path.lastIndexOf('/') === path.length - 1) {
        path = path.slice(0, -1);
      }

      return path.slice(0, path.lastIndexOf('/'));
    }

    /**
     * List files found in a given path.
     */
    service.directory = function (path) {
      return remoteStorage.invoke('directory', { path: path });
    };

    /**
     * Persist a file to an existing folder.
     */
    service.save = function (path, content) {
      var name = extractNameFromPath(path);

      return remoteStorage.invoke('save', {
          path: path,
          name: name,
          content: btoa(content),
          type: 'file',
          meta: {
            created: Math.round(new Date().getTime()/1000.0)
          }
        });
    };

    /**
     * Create the folders contained in a path.
     */
    service.createFolder = function (path) {
      return remoteStorage.invoke('createFolder', { path: path });
    };

    /**
     * Loads the content of a file.
     */
    service.load = function (path) {
      return remoteStorage.invoke('load', { path: path }, function (data) {
          this.resolve(atob(data));
        });
    };

    /**
     * Removes a file or directory.
     */
    service.remove = function (path) {
      return remoteStorage.invoke('remove', { path: path });
    };

    /**
     * Renames a file or directory
     */
    service.rename = function (source, destination) {
      return remoteStorage.invoke('rename', { source: source, destination: destination });
    };

    return service;
  })
  .run(function(ApiDesignerRepository, config, eventService) {
    config.set('fsFactory', 'ApiDesignerRepository');
  });