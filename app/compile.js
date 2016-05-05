var chalk       = require("chalk"),
    fs          = require("graceful-fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),
    yargs       = require('yargs'),

    writeEntity = require("../lib/fs").writeEntity,

    meta        = require('./meta');

var readdir = function(dir) {
  var deferred = q.defer();
  fs.readdir(dir, function (err, data) {
    if (err) {deferred.reject(err)}
    else {
      deferred.resolve(data);
    }
  });
  return deferred.promise;
};

module.exports = function(typeSlug) {

  util.log(chalk.magenta("compile.js"),typeSlug);

  var deferred = q.defer();

  if (!typeSlug) {
    deferred.reject("No type specified!")
    return deferred.promise;
  }

  var source_directory = path.join(meta.rawRoot,typeSlug);
  var destination_directory = path.join(meta.compiledRoot,typeSlug);
  util.log("compile-"+typeSlug+": /raw/"+typeSlug+" -> /compiled/"+typeSlug);

  return readdir(source_directory)

  .then(function (filenames) {
    util.log("Read "+filenames.length+" files.");
    var promises = filenames.map(function(filename) {
      var instanceSlug = filename.replace(".json","");
      var deferred = q.defer();
      fs.readFile(path.join(source_directory,filename), 'utf-8', function (err, data) {
        if (err) {
          deferred.resolve({
            "instanceSlug":instanceSlug,
            "stage":"readFile",
            "error":err
          });
          return;
        }
        try {
          deferred.resolve(JSON.parse(data));
        } catch(parseErr) {
          deferred.resolve({
            "instanceSlug":instanceSlug,
            "stage":"parse",
            "error":parseErr
          });
        }
      });
      return deferred.promise;
    });
    return q.all(promises);
  })

  .then(function(entities) {
    var compiled_content_as_object = require("./compilers/compile-"+typeSlug)(null,entities);

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

    deferred.resolve(compiled_content_as_object);
    return deferred.promise;

  })
  .catch(function (error) {
    deferred.reject(error);
    return deferred.promise;
  });

  // returns a promise
};
