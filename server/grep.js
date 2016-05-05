var exec = require("child_process").exec,
    fs   = require('graceful-fs'),
    meta = require("../app/meta"),
    path = require('path');

//require("./app/polyfill");

function _filepathsToArray(err, stdin, stdout) {
  var filepaths = stdin.split('\n');
  var outbound = [];
  filepaths.forEach(function(filepath) {
    if (filepath == "") return;
    var entity = JSON.parse(fs.readFileSync(filepath));
    entity.typeSlug = filepath.split("/")[1];
    outbound.push(entity);
  });
  return outbound;
}

module.exports = function(app) {

  app.get(/^\/grep\/(.+)\/(.+)$/, function(req, res) {
    console.log("GET /grep",req.params[0],req.params[1]);

    var entityType = req.params[0];
    var pattern = req.params[1];
    var targetPath = path.join(meta.root,"raw",entityType,"*").replace(/\\/g,'/');
    var command = "grep -l "+pattern+" "+targetPath;

    exec(command, function(err, stdin, stdout){
      res.send(_filepathsToArray(err, stdin, stdout));
    });

  });

  app.get(/^\/grep\/(.+)$/, function(req, res) {
    console.log("GET /grep",req.params[0]);

    var pattern = req.params[0];
    var targetPath = path.join(meta.root,"raw","*").replace(/\\/g,'/');
    var command = "grep -rl "+pattern+" "+targetPath;

    exec(command, function(err, stdin, stdout){
      res.send(_filepathsToArray(err, stdin, stdout));
    });

  });

}
