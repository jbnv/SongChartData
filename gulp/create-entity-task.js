var path        = require("path"),
    yargs       = require('yargs');

    meta        = require('../app/meta');
    create      = require('../app/create-entity');

module.exports = function(gulp,model) {

  var spec = new model();

  gulp.task(spec.typeSlug, "Create a new "+spec.typeNoun+" entity.", function() {
    var instance = new model(yargs);
    var destinationDirectory = path.join(meta.rawRoot,spec.typeSlug);
    create(instance.instanceSlug,destinationDirectory,instance);
  }, {
    options: spec.parameters
  }); // 'assemble'

};
