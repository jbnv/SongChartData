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
  util.log(chalk.magenta("compile-playlist.js"));

  titles = {};
  var songs = readEntity(path.join("compiled","song","by-playlist"));

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;

    titles[slug] = entity.title;
    entity.songs = scoring.sortAndRank(songs[entity.instanceSlug]) || [];

    // Check to see if there is a filter (entity.filter).
    // If so, use it. If not, look for the word in the song's "playlists" value.
    var filter = function(song) {
      if (song.playlists) {
        song.playlists.forEach(function(songPlaylistSlug) {
          if (songPlaylistSlug === slug) {
            entity.songs.push(song);
          }
        });
      }
    };

    if (entity.filter) {
      // Check the keys on the filter object to determine what we are doing with it.
      // For now, assume that the object has only one key.
      Object.keys(entity.filter).forEach(function(key) {
        var pattern = entity.filter[key];
        var exp = new RegExp(pattern);

        if (key === "title") {
          // Title: Argument is a pattern to match.
          //util.log("Title pattern:",chalk.magenta(pattern));
          filter = function(song) {
            if (exp.test(song.title)) { entity.songs.push(song); }
          }
        }

        if (key === "tag") {
          // Tag: Argument is a pattern to match.
          //util.log("Tag pattern:",chalk.magenta(pattern));
          filter = function(song) {
            if (song.tags) {
              song.tags.forEach(function(tag) {
                if (exp.test(tag)) { entity.songs.push(song); }
              })
            }
          }
        }
      });
    }

    meta.getSongs().forEach(filter);
    entity.songs = scoring.sortAndRank(entity.songs);
    scoring.scoreCollection.call(entity);

    util.log(
      chalk.blue(entity.instanceSlug),
      entity.title,
      chalk.gray(entity.songs.length),
      chalk.gray(entity.score || 0),
      chalk.gray(entity.songAdjustedAverage || 0)
    );

  });

  unrankedSongs = [];

  return {
    "all": entities,
    "titles": titles,
    "unranked": unrankedSongs
  }
}
