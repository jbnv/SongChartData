var chalk       = require("chalk"),
    expandObject = require("../../lib/expand-object"),
    fs          = require("fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),

    Era         = require('../../lib/era'),
    meta        = require('../meta'),
    scoring     = require("../scoring");

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
  allGenres = meta.getGenres();
  allPlaylists = meta.getPlaylists();

  var titles = {},
      artists = {},
      genres = {},
      playlists = {},
      sources = {},
      decades = {},
      years = {},
      months = {},
      unranked = [];

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;

    titles[entity.instanceSlug] = entity.title;

    scoring.score(entity);

    if (entity.genre && !entity.genres) { entity.genres = [entity.genre]; }
    if (entity.playlist && !entity.playlists) { entity.playlists = [entity.playlist]; }

    if (entity.artists) {
      for (var artistSlug in entity.artists) {
        if (!artists[artistSlug]) artists[artistSlug] = [];
        artists[artistSlug].push(entity);
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
      entity.genres = entity.genres.expand(allGenres);
    } else {
       entity.genres = [];
    }

    if (entity.playlists) {
      entity.playlists.forEach(function(playlistSlug) {
        if (!playlists[playlistSlug]) playlists[playlistSlug] = [];
        playlists[playlistSlug].push(entity);
      });
      entity.playlists = entity.playlists.expand(allPlaylists);
    } else {
       entity.playlists = [];
    }

    if (entity.source) {
      if (!sources[entity.source]) sources[entity.source] = [];
      sources[entity.source].push(entity);
    }

    if (entity.debut && entity.debut !== "") {
      var era = new Era(entity.debut);
      if (era.decade) { pushToCollection(decades,era.decade,entity); }
      if (era.year) { pushToCollection(years,era.year,entity); }
      //TEMP Month push needs to actually put the song in all months to which is is ranked.
      if (era.month) { pushToCollection(months,entity.debut,entity); }
    }

    if ((entity.ranks || []).length == 0) unranked.push(entity);

    util.log(
      chalk.blue(entity.instanceSlug),
      entity.title,
      chalk.gray(entity.score || 0)
    );

  });

  return {
    "all": scoring.sortAndRank(entities),
    "titles": titles,
    "by-artist": artists,
    "by-genre": genres,
    "by-playlist": playlists,
    "by-source": sources,
    "by-decade": decades,
    "by-year": years,
    "by-month": months,
    "unranked": unranked
  }
}
