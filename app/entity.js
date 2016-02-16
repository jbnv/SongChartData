var fs          = require('fs'),
    path        = require('path');

module.exports = function(slug,destinationDir,object) {
  var targetPath = path.join(destinationDir,slug+".json");
  fs.writeFileSync(targetPath,JSON.stringify(object));
};
