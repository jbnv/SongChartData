var gulp        = require('gulp-help')(require('gulp'));

var entityModels = ["artist","geo","genre","playlist","song","source"];
entityModels.forEach(function(slug) {
  require('./gulp/entity-task')(gulp,require("./app/models/"+slug));
});

gulp.task("compile-search", "Compile search entities.", function() {
  require('./app/compilers/compile-search')();
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
