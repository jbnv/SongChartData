var fs          = require('fs'),
    path        = require('path');

module.exports = function(route,obj) {
  var targetPath = path.join(meta.root, route+".json");
  if (obj) {
    fs.writeFileSync(targetPath,JSON.stringify(obj));
  } else {
    obj = fs.readFileSync(targetPath);
  }
  return obj;
};
