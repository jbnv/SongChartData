// Wrapper for fs and q. Methods that return a promise.

var fs          = require("graceful-fs"),
    path        = require("path"),
    pretty      = require("jsonpretty"),
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

function _readEntity(route) {
  var targetPath = path.join(path.normalize("."), route+".json");
  json = fs.readFileSync(targetPath);
  if (!json || json === "") return null;
  var outbound = {};
  try {
    outbound = JSON.parse(json);
  } catch (e) {
    console.log("readEntity:",route,e,json);
  }
  return outbound;
};

exports.readEntity = _readEntity;

exports.writeEntity = function(route,obj) {
  var targetPath = path.join(path.normalize("."), route+".json");
  fs.writeFileSync(targetPath,JSON.stringify(obj)); //TEMP not pretty(obj); doesn't work for function-based objects!
  return obj;
};

exports.lookupEntity = function(instanceSlug,typeSlug) {
  return _readEntity(path.join("raw",typeSlug,instanceSlug));
}

exports.lookupEntities = function(array,typeSlug) {
  return array.map(function(instanceSlug) {
    return _readEntity(path.join("raw",typeSlug,instanceSlug));
  });
}

function dirToObject(dir) {
  content = {};
  fs.readdirSync(dir)
    .filter(function(file){
      return !fs.statSync(path.join(dir, file)).isDirectory();
    })
    .forEach(function(file){
      slug = file.replace(".json","");
      content[slug] = JSON.parse(fs.readFileSync(path.join(dir, file)));
    });
  return content;
}
