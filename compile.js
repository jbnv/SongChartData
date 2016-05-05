var chalk       = require("chalk"),
    util        = require("gulp-util"),

    typeSlug = process.argv[2];

require('./app/compile')(typeSlug)
.catch(function (error) {
  util.log(
    chalk.red("ERROR"),
    error
  );
})
.done()
;
