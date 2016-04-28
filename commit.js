var chalk       = require("chalk"),
    fs          = require("graceful-fs"),
    git         = require('gulp-git'),
    path        = require("path"),
    q           = require("q"),
    vfs         = require("vinyl-fs"),
    yargs       = require('yargs');

// node commit.js <type> [-r|--raw] [-m <message>]

var typeSlug = process.argv[2];

var rawRoute = "", compiledRoute = "", message = "";

if (typeSlug && typeSlug != "-m") {
  rawRoute = "./raw/"+typeSlug;
  compiledRoute = "./compiled/"+typeSlug;
  message = yargs.argv.m || "Updates of '"+typeSlug+"' entities.";
} else {
  rawRoute = "./raw";
  compiledRoute = "./compiled";
  message = yargs.argv.m || "Updates of entities.";
}

var sources = [rawRoute];
if (!yargs.argv.r && !yargs.argv.raw) sources.push(compiledRoute);

vfs.src(sources).pipe(git.add()).pipe(git.commit(message));
