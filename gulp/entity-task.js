var chalk       = require("chalk"),
    fs          = require("fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),
    yargs       = require('yargs');

    meta        = require('../app/meta');
    entity      = require('../app/entity');

module.exports = function(gulp,model) {

  var spec = new model();

  gulp.task("create-"+spec.typeSlug, "Create a new "+spec.typeNoun+" entity.", function() {
    var instance = new model(yargs);
    var route = meta.rawRoute(spec.typeSlug,instance.instanceSlug);
    entity(route,instance);
    util.log(chalk.green(route),instance);
  }, {
    options: spec.parameters
  });

  gulp.task("edit-"+spec.typeSlug, "Edit an existing "+spec.typeNoun+" entity.", function() {
    //TODO
    // var instance = new model(yargs);
    // var destinationDirectory = path.join(meta.rawRoot,spec.typeSlug);
    // create(instance.instanceSlug,destinationDirectory,instance);
    // util.log(instance.instanceSlug,instance);
  }, {
    options: spec.parameters
  });

  gulp.task(spec.typeSlug, "Show details for an existing "+spec.typeNoun+" entity.", function() {
    //TODO
    // var instance = new model(yargs);
    // var destinationDirectory = path.join(meta.rawRoot,spec.typeSlug);
    // create(instance.instanceSlug,destinationDirectory,instance);
    // util.log(instance.instanceSlug,instance);
  });

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

  gulp.task("compile-"+spec.typeSlug, "Compile "+spec.typeNoun+" entities.", function() {

    var source_directory = path.join(meta.rawRoot,spec.typeSlug);
    var destination_directory = path.join(meta.compiledRoot,spec.typeSlug);
    util.log("compile-"+spec.typeSlug+": /raw/"+spec.typeSlug+" -> /compiled/"+spec.typeSlug);

    readdir(source_directory)
    .then(function (filenames) {
      util.log("Read "+filenames.length+" files.");
      var promises = filenames.map(readFile(source_directory));
      return q.all(promises);
    })
    .then(function(entityFileTexts) {
      var entities = entityFileTexts.map(JSON.parse);
      var compiled_content_as_object = require("../app/compilers/compile-"+spec.typeSlug)(null,entities);

      for (var key in compiled_content_as_object) {
        var route = meta.compiledRoute(spec.typeSlug,key);
        var content = compiled_content_as_object[key];
        entity(route,content);
        util.log(chalk.green(route));
      }

      if (compiled_content_as_object.all) {
        var count = 0;
        compiled_content_as_object.all.forEach(function(e) {
          if (!e.instanceSlug) {
            util.log(e.title+" "+chalk.red("No instanceSlug! Skipped."));
            return;
          }
          var route = meta.compiledRoute(spec.typeSlug,e.instanceSlug);
          entity(route,e);
          count++;
        });
        util.log("Compiled "+chalk.green(count)+" entities.");
      }
    })
    .catch(function (error) {
      util.log("ERROR:",error);
    })
  });

};
