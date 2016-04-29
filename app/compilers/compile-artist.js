var chalk       = require("chalk"),
    fs          = require("fs"),
    path        = require("path"),
    numeral     = require("numeral"),
    q           = require("q"),
    util        = require("gulp-util"),

    readEntity  = require("../../lib/fs").readEntity,
    lookupEntity = require("../../lib/fs").lookupEntity,
    lookupEntities = require("../../lib/fs").lookupEntities,

    meta        = require('../meta'),
    scoring     = require('../scoring'),
    transform   = require('../transform');

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  util.log(chalk.magenta("compile-artist.js"));

  titles = {};
  roles = {};
  genres = {};
  origins = {};
  tags = {};

  var songs = readEntity(path.join("compiled","song","by-artist")) || {};
  var allArtistTypes = require("../models/artist-types") || {};
  var allTags = readEntity(path.join("compiled","tag","for-artist")) || {};

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    var entitySongs = songs[slug] || [];

    entity.songs = scoring.sortAndRank(entitySongs);
    scoring.scoreCollection.call(entity);

    titles[entity.instanceSlug] = entity.title;

    if (entity.tags) {
      entity.tags.forEach(function(tag) {
        if (!tags[tag]) tags[tag] = [];
        tags[tag].push(entity);
      });
      entity.tags = lookupEntities(entity.tags,"tag");
    }

    if (entity.roles) {
      entity.roles.forEach(function(roleSlug) {
        if (!roles[roleSlug]) roles[roleSlug] = [];
        roles[roleSlug].push(entity);
      });
      entity.roles = lookupEntities(entity.roles,"role");
    }

    if (entity.genres) {
      entity.genres.forEach(function(genreSlug) {
        if (!genres[genreSlug]) genres[genreSlug] = [];
        genres[genreSlug].push(entity);
      });
      entity.genres = lookupEntities(entity.genres,"genre");
    }

    if (entity.origin) {
        if (!origins[entity.origin]) origins[entity.origin] = [];
        origins[entity.origin].push(entity);
        entity.origin = lookupEntity(entity.origin,"geo");
    }

    if (entity.type) {
      var typeSlug = entity.type;
      entity.type = allArtistTypes[typeSlug];
      entity.type.slug = typeSlug;
    }

    if (entity.members) {
      entity.members = lookupEntities(entity.members,"artist");
    }

    if (entity.xref) {
      entity.xref = lookupEntities(entity.xref,"artist");
    }

    numeral.zeroFormat("");

    // util.log(
    //   chalk.blue(entity.instanceSlug),
    //   entity.title,
    //   chalk.gray(numeral(entity.songs.length).format("0")),
    //   chalk.gray(numeral(entity.score || 0).format("0.00")),
    //   chalk.gray(numeral(entity.songAdjustedAverage || 0).format("0.00"))
    // );

  });

  /* Calculate song rankings on all terms.*/

  util.log("Ranking by genre.");
  scoring.rankEntities(entities,genres,"genre");

  util.log("Ranking by origin.");
  scoring.rankEntities(entities,origins,"origin");

  util.log("Ranking by tag.");
  scoring.rankEntities(entities,tags,"tag");

  util.log("Artist processing complete.");

  entities = scoring.sortAndRank(entities,transform.sortBySongAdjustedAverage);

  return {
    "all": entities,
    "titles": titles,
    "by-genre": genres,
    "by-origin": origins,
    "by-tag": tags
  }
}
