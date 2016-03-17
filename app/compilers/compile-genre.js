var fs = require("fs"),
    meta = require('../meta'),
    scoring = require('../scoring');

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  titles = {};

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    entity.artists = [];
    entity.songs = [];
    entity.score = 0;
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
        song.genres.forEach(function(genre) {
          if (genre.slug === slug) {
            entity.songs.push(song);
            entity.score += song.score;
          }
        });
      }
    });

    entity.songs = scoring.sortAndRank(entity.songs);

  });

  return {
    "all": entities,
    "titles": titles,
  }
}
