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

module.exports = {
    root: root,
    rawRoot: rawRoot,
    compiledRoot: compiledRoot,
    rawRoute: function(typeSlug,instanceSlug) { return path.join("raw",typeSlug,instanceSlug); },
    compiledRoute: function(typeSlug,instanceSlug) { return path.join("compiled",typeSlug,instanceSlug); },
    chartRoute: function(typeSlug,instanceSlug) { return path.join("compiled",typeSlug,"charts",instanceSlug); },
}
