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
var rawRoot = root+"/raw";

module.exports = {
    root: root,
    rawRoot: rawRoot,
}
