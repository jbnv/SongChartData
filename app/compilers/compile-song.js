var chalk       = require("chalk"),
    clone       = require("clone"),
    expandObject = require("../../lib/expand-object"),
    fs          = require("fs"),
    numeral     = require("numeral"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),

    readEntity  = require("../../lib/fs").readEntity,
    lookupEntity = require("../../lib/fs").lookupEntity,
    lookupEntities = require("../../lib/fs").lookupEntities,

    Era         = require('../../lib/era'),
    EntityMap   = require('../../lib/entity-map'),
    meta        = require('../meta'),
    scoring     = require("../scoring"),
    transform   = require("../transform");

require("../polyfill");

function pushToCollection(collection,slug,entity) {
  if (!collection[slug]) collection[slug] = [];
  collection[slug].push(entity);
}

function transformArtist(artist,slug,roleSlug) {
  return { slug: slug, title: artist.title, roleSlug: roleSlug };
}

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  util.log(chalk.magenta("compile-song.js"));

  allArtists = meta.getArtists();

  var titles = {},
      artists = {},
      genres = {},
      playlists = {},
      sources = new EntityMap(),
      decades = {},
      years = {},
      months = {},
      unscored = [],
      errors = [];

  entities.forEach(function(entity) {
    if (entity.error) { errors.push(entity); return; }

    var slug = entity.instanceSlug;
    if (!slug) return;

    entity.ranks = {};
    titles[entity.instanceSlug] = entity.title;

    scoring.score(entity);

    if (entity.genre && !entity.genres) { entity.genres = [entity.genre]; }
    if (entity.playlist && !entity.playlists) { entity.playlists = [entity.playlist]; }

    if (entity.artists) {
      for (var artistSlug in entity.artists) {
        var artist = entity.artists[artistSlug] || {};
        if (!artists[artistSlug]) artists[artistSlug] = [];
        var entityClone = clone(entity);
        delete entityClone.artists;
        entityClone.role = artist; //FUTURE artist.roleSlug;
        entityClone.scoreFactor = 1.00; //FUTURE artist.scoreFactor;
        switch (entityClone.role) {
          case true: entityClone.scoreFactor = 1.00; break;
          case "featured": entityClone.scoreFactor = 0.50; break;
          case "lead": entityClone.scoreFactor = 0.75; break;
          case "backup": entityClone.scoreFactor = 0.10; break;
          case "writer": entityClone.scoreFactor = 1.00; break;
          case "producer": entityClone.scoreFactor = 0.20; break;
          case "sample": entityClone.scoreFactor = 0.1; break;
          default: entityClone.scoreFactor = 0.25;
        }
        if (entityClone.score) entityClone.score *= entityClone.scoreFactor;
        artists[artistSlug].push(entityClone);
      }
      entity.artists = expandObject.call(entity.artists,allArtists,transformArtist);
    } else {
       entity.artists = [];
    }

    if (entity.genres) {
      entity.genres.forEach(function(genreSlug) {
        if (!genres[genreSlug]) genres[genreSlug] = [];
        genres[genreSlug].push(entity);
      });
    }

    try {
      entity.genres = lookupEntities(entity.genres,"genre");
    } catch(err) {
      errors.push({"instanceSlug":slug,"stage":"genres","error":err});
    }

    if (entity.playlists) {
      entity.playlists.forEach(function(playlistSlug) {
        if (!playlists[playlistSlug]) playlists[playlistSlug] = [];
        playlists[playlistSlug].push(entity);
      });
    }

    try {
      entity.playlists = lookupEntities(entity.playlists,"playlist");
    } catch(err) {
      errors.push({"instanceSlug":slug,"stage":"playlists","error":err});
    }

    sourceSlug = entity.source;
    sources.push(sourceSlug,entity);

    try {
      entity.source = lookupEntity(entity.source,"source");
    } catch(err) {
      errors.push({"instanceSlug":slug,"stage":"source","error":err});
    }

    if (entity.debut && entity.debut !== "") {
      var era = new Era(entity.debut);
      entity.debutEra = era.clone();
      if (era.decade) { pushToCollection(decades,""+era.decade+"s",entity); }
      if (era.year) { pushToCollection(years,era.year,entity); }
      //TEMP Month push needs to actually put the song in all months to which is is scoreed.
      if (era.month) {
        // Loop through the scores
        pushToCollection(months,entity.debut,entity);
      }
    }

    if ((entity.scores || []).length == 0) unscored.push(entity);

    numeral.zeroFormat("");

    // util.log(
    //   chalk.blue(entity.instanceSlug),
    //   entity.title,
    //   chalk.gray(numeral(entity.score).format("0.00"))
    // );

  });

  /* Calculate song rankings on all terms.*/

  util.log("Ranking by artist.");
  scoring.rankEntities(entities,artists,"artist");

  util.log("Ranking by genre.");
  scoring.rankEntities(entities,genres,"genre");

  util.log("Ranking by playlist.");
  scoring.rankEntities(entities,playlists,"playlist");

  util.log("Ranking by source.");
  scoring.rankEntities(entities,sources,"source");

  util.log("Ranking by decade.");
  scoring.rankEntities(entities,decades,"decade");

  util.log("Ranking by year.");
  scoring.rankEntities(entities,years,"year");

  // months = {},

  util.log("Song processing complete.");

  entities = scoring.sortAndRank(entities);

  return {
    "all": entities,
    "titles": titles,
    "by-artist": artists,
    "by-genre": genres,
    "by-playlist": playlists,
    "by-source": sources,
    "by-decade": decades,
    "by-year": years,
    "by-month": months,
    "unscored": unscored,
    "errors":errors
  }
}
