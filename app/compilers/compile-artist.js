var chalk       = require("chalk"),
    fs          = require("fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),

    readEntity  = require("../../lib/fs").readEntity,

    meta        = require('../meta'),
    scoring     = require('../scoring'),
    transform   = require('../transform');

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  util.log(chalk.magenta("compile-artist.js"));

  titles = {};
  genres = {};
  origins = {};

  var songs = readEntity(path.join("compiled","song","by-artist"));

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    var entitySongs = songs[slug] || [];

    entity.songs = scoring.sortAndRank(entitySongs);
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

    util.log(
      chalk.blue(entity.instanceSlug),
      entity.title,
      chalk.gray(entity.songs.length),
      chalk.gray(entity.score || 0),
      chalk.gray(entity.songAdjustedAverage || 0)
    );

  });

  return {
    "all": scoring.sortAndRank(entities,transform.sortBySongAdjustedAverage),
    "titles": titles,
    "by-genre": genres,
    "by-origin": origins
  }
}
