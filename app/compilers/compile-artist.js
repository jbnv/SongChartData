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
  tags = {};

  var songs = readEntity(path.join("compiled","song","by-artist"));
  var allGenres = readEntity(path.join("compiled","genre","all"));
  var allLocations = readEntity(path.join("compiled","geo","all"));
  var allArtistTypes = require("../models/artist-types");
  var allTags = readEntity(path.join("compiled","tag","for-artist"));

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    var entitySongs = songs[slug] || [];

    entity.songs = scoring.sortAndRank(entitySongs);
    scoring.scoreCollection.call(entity);

    titles[entity.instanceSlug] = entity.title;

    if (entity.tags) {
      entity.tags.forEach(function(tag) {
        if (!tags[tag]) tags[tag] = [];
        tags[tag].push(slug);
      });
      entity.tags = entity.tags.expand(allTags);
    } else {
      entity.tags = [];
    }

    if (entity.genres) {
      entity.genres.forEach(function(genreSlug) {
        if (!genres[genreSlug]) genres[genreSlug] = [];
        genres[genreSlug].push(slug);
      });
    }
    entity.genres = entity.genres.expand(allGenres);

    if (entity.origin) {
        if (!origins[entity.origin]) origins[entity.origin] = [];
        origins[entity.origin].push(slug);
        entity.origin = allLocations.find(function(el) { return el.instanceSlug === entity.origin; });
    }

    if (entity.type) {
      var typeSlug = entity.type;
      entity.type = allArtistTypes[typeSlug];
      entity.type.slug = typeSlug;
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
    "by-origin": origins,
    "by-tag": tags
  }
}
