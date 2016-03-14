var fs = require('fs'),
    path = require('path');

// return folders within a path
function folders(dir) {
  return fs.readdirSync(dir)
      .filter(function(file){
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
};

var root = path.normalize(".");
var rawRoot = path.join(root,"raw");
var compiledRoot = path.join(root,"compiled");

function _rawRoute(typeSlug,instanceSlug) { return path.join("raw",typeSlug,""+instanceSlug); }
function _compiledRoute(typeSlug,instanceSlug) { return path.join("compiled",typeSlug,""+instanceSlug); }
function _chartRoute(typeSlug,instanceSlug) { return path.join("compiled",typeSlug,"charts",""+instanceSlug); }

function _getCompiledObject(typeSlug,instanceSlug) {
  return function() {
    //TODO Check for file not existing.
    var path = meta.compiledRoute(typeSlug,""+instanceSlug+".json");
    return JSON.parse(fs.readFileSync(path));
  };
}

module.exports = {
  root: root,
  rawRoot: rawRoot,
  compiledRoot: compiledRoot,
  rawRoute: _rawRoute,
  compiledRoute: _compiledRoute,
  chartRoute: _chartRoute,
  getCompiledObject: _getCompiledObject,

  getArtists: _getCompiledObject("artist","all"),
  getSongs: _getCompiledObject("song","all"),

  months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
}
