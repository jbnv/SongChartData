var gulp        = require('gulp-help')(require('gulp'));

var entityModels = ["artist","geo","genre","song","source"];
entityModels.forEach(function(slug) {
  require('./gulp/create-entity-task')(gulp,require("./app/models/"+slug));
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
