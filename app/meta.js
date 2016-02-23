var fs = require('fs'),
    path = require('path');

// return folders within a path
function folders(dir) {
  return fs.readdirSync(dir)
      .filter(function(file){
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
};

var root = "/home/jay/github/SongChartsData";
// root needs to be smarter! needs to determine the directory in which the application resides!
var rawRoot = root+"/raw";
var compiledRoot = root+"/compiled";

module.exports = {
    root: root,
    rawRoot: rawRoot,
    compiledRoot: compiledRoot,
}
