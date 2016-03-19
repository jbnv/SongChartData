// Wrapper for fs and q. Methods that return a promise.

var fs          = require("graceful-fs"),
    path        = require("path"),
    q           = require("q");

exports.readDir = function(dir) {
  var deferred = q.defer();
  fs.readdir(dir, function (err, data) {
    if (err) {deferred.reject(err)}
    else { deferred.resolve(data) }
  });
  return deferred.promise;
};

exports.readFileFn = function(dir) {
  return function(filename) {
    var deferred = q.defer();
    fs.readFile(path.join(dir,filename), 'utf-8', function (err, data) {
      if (err) {deferred.reject(err)}
      else { deferred.resolve(data) }
    });
    return deferred.promise;
  };
};

exports.readEntity = function(route) {
  var targetPath = path.join(path.normalize("."), route+".json");
  return JSON.parse(fs.readFileSync(targetPath));
};

exports.writeEntity = function(route,obj) {
  var targetPath = path.join(path.normalize("."), route+".json");
  fs.writeFileSync(targetPath,JSON.stringify(obj));
  return obj;
};
