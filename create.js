var chalk       = require("chalk"),
    path        = require("path"),
    util        = require("gulp-util"),
    yargs       = require('yargs'),

    writeEntity = require("../lib/fs").writeEntity,

    meta        = require('../app/meta');

var typeSlug = process.argv[2];
if (!typeSlug) {
  console.log("No type specified!");
  return;
}

var model = require("./app/models/"+typeSlug);

var instance = new model(yargs);
var route = meta.rawRoute(typeSlug,instance.instanceSlug);
writeEntity(route,instance);
util.log(chalk.green(route),instance);
