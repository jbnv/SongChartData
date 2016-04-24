var chalk       = require("chalk"),
    fs          = require("graceful-fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),
    yargs       = require('yargs'),

    writeEntity = require("./lib/fs").writeEntity,

    meta        = require('./app/meta');

var a = process.argv[2];
var b = process.argv[3];
if (!a || !b) {
  return;
}

var entityA = meta.getRawObject("song",a)();
var entityB = meta.getRawObject("song",b)();

var temp = entityA.scores;
entityA.scores = entityB.scores;
entityB.scores = temp;

writeEntity(meta.rawRoute("song",a),entityA);
writeEntity(meta.rawRoute("song",b),entityB);

util.log(
  chalk.blue(a),
  entityA.title
);
util.log(
  chalk.blue(b),
  entityB.title
);
