var chalk       = require("chalk"),
    fs          = require("fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),

    readEntity  = require("../../lib/fs").readEntity,

    meta        = require('../meta'),
    scoring     = require('../scoring');

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  util.log(chalk.magenta("compile-source.js"));

    titles = {};
    var songs = readEntity(path.join("compiled","song","by-source"));

    entities.forEach(function(entity) {
      var slug = entity.instanceSlug;
      util.log(chalk.blue(entity.instanceSlug),entity.title);

      entity.songs = scoring.sortAndRank(songs[entity.instanceSlug]) || [];
      scoring.scoreCollection.call(entity);

    });

  return {
    "all": entities,
    "titles": titles,
  }
}
