var path        = require("path"),
    util        = require("gulp-util"),
    yargs       = require('yargs');

    meta        = require('../app/meta');
    create      = require('../app/entity');

module.exports = function(gulp,model) {

  var spec = new model();

  gulp.task("create-"+spec.typeSlug, "Create a new "+spec.typeNoun+" entity.", function() {
    var instance = new model(yargs);
    var destinationDirectory = path.join(meta.rawRoot,spec.typeSlug);
    create(instance.instanceSlug,destinationDirectory,instance);
    util.log(instance.instanceSlug,instance);
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

};
