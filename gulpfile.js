var gulp        = require('gulp-help')(require('gulp')),
    git         = require('gulp-git'),

    meta        = require('./app/meta');

meta.entityTypes.forEach(function(slug) {
  require('./gulp/entity-task')(gulp,require("./app/models/"+slug));
});

gulp.task("compile-search", "Compile search entities.", function() {
  require('./app/compilers/compile-search')();
});

gulp.task("commit-data","Commit data changes to Git.", function() {
  return gulp
    .src(["./raw/*","./compiled/*"])
    .pipe(git.add())
    .pipe(git.commit("Data updates."));
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
