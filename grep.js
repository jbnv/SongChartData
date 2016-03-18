var chalk       = require("chalk"),
    fs          = require("graceful-fs"),
    exec        = require("child_process").exec,
    path        = require("path");

var entityType = process.argv[2];
var pattern = process.argv[3];
var targetPath = path.join(".","raw",entityType,"*");
var command = "grep -l "+pattern+" "+targetPath;

exec(command, function(err, stdin, stdout){
  var filepaths = stdin.split('\n');
  filepaths.forEach(function(filepath) {
    if (filepath == "") return;
    var entity = JSON.parse(fs.readFileSync(filepath));
    console.log(chalk.blue(entity.instanceSlug),entity.title);
  });
});
