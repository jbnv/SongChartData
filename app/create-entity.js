var fs          = require('fs'),
    path        = require('path');

module.exports = function(slug,destinationDir,object) {
  var outPath = path.join(destinationDir,slug+".json");
  fs.writeFileSync(outPath,JSON.stringify(object));
};
