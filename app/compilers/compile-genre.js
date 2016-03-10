var fs = require("fs"),
    meta = require('../meta');

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  titles = {};

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    entity.artists = [];
    entity.songs = [];
    titles[slug] = entity.title;

    meta.getArtists().forEach(function(artist) {
      if (artist.genres) {
        artist.genres.forEach(function(artistGenreSlug) {
          if (artistGenreSlug === slug) {
            entity.artists.push(artist);
          }
        });
      }
    });

    meta.getSongs().forEach(function(song) {
      if (song.genres) {
        song.genres.forEach(function(songGenreSlug) {
          if (songGenreSlug === slug) {
            entity.songs.push(song);
          }
        });
      }
    });

  });

  return {
    "all": entities,
    "titles": titles,
  }
}
