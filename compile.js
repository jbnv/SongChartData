var chalk       = require("chalk"),
    fs          = require("graceful-fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),
    yargs       = require('yargs'),

    writeEntity = require("./lib/fs").writeEntity,

    meta        = require('./app/meta');

  var readdir = function(dir) {
    var deferred = q.defer();
    fs.readdir(dir, function (err, data) {
      if (err) {deferred.reject(err)}
      else { deferred.resolve(data) }
    });
    return deferred.promise;
  };

  function readFile(dir) {
    return function(filename) {
      var deferred = q.defer();
      fs.readFile(path.join(dir,filename), 'utf-8', function (err, data) {
        if (err) {deferred.reject(err)}
        else { deferred.resolve(data) }
      });
      return deferred.promise;
    };
  };

  function parse(json) {
    var outbound = {};
    try {
      outbound = JSON.parse(json);
    } catch(err) {
      util.log(chalk.red(err.message),json);
    }
    return outbound;
  }

var typeSlug = process.argv[2];
if (!typeSlug) {
  console.log("No type specified!");
  return;
}

var source_directory = path.join(meta.rawRoot,typeSlug);
var destination_directory = path.join(meta.compiledRoot,typeSlug);
util.log("compile-"+typeSlug+": /raw/"+typeSlug+" -> /compiled/"+typeSlug);

readdir(source_directory)
.then(function (filenames) {
  util.log("Read "+filenames.length+" files.");
  var promises = filenames.map(readFile(source_directory));
  return q.all(promises);
})
.then(function(entityFileTexts) {
  var entities = entityFileTexts.map(parse);
  var compiled_content_as_object = require("./app/compilers/compile-"+typeSlug)(null,entities);

  for (var key in compiled_content_as_object) {
    if (key == "error") continue;
    var route = meta.compiledRoute(typeSlug,key);
    var content = compiled_content_as_object[key];
    writeEntity(route,content);
    util.log(chalk.green(route));
  }

  if (compiled_content_as_object.all) {
    var count = 0;
    util.log("Processing "+chalk.green(compiled_content_as_object.all.length)+" entities.");
    compiled_content_as_object.all.forEach(function(e) {
      if (!e.instanceSlug) {
        util.log(e.title+" "+chalk.red("No instanceSlug! Skipped."));
        return;
      }
      var route = meta.compiledRoute(typeSlug,e.instanceSlug);
      writeEntity(route,e);
      count++;
    });
    util.log("Compiled "+chalk.green(count)+" entities.");
  }

  (compiled_content_as_object.errors || []).forEach(function(error) {
    util.log(
      chalk.magenta(error.typeSlug),
      chalk.blue(error.instanceSlug),
      error.error
    );
  });

})
.catch(function (error) {
  util.log("ERROR:",error);
});
