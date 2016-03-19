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
  util.log(chalk.magenta("compile-artist.js"));

  titles = {};
  genres = {};
  origins = {};

  var songs = readEntity(path.join("compiled","song","by-artist"));

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    util.log(chalk.blue(entity.instanceSlug),entity.title);

    entity.songs = scoring.sortAndRank(songs[slug]);
    scoring.scoreCollection.call(entity);

    titles[entity.instanceSlug] = entity.title;

    if (entity.genres) {
      entity.genres.forEach(function(genreSlug) {
        if (!genres[genreSlug]) genres[genreSlug] = [];
        genres[genreSlug].push(slug);
      });
    }

    if (entity.origin) {
        if (!origins[entity.origin]) origins[entity.origin] = [];
        origins[entity.origin].push(slug);
    }

  });

  return {
    "all": entities,
    "titles": titles,
    "by-genre": genres,
    "by-origin": origins
  }
}
