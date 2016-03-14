var fs = require("fs"),
    meta = require('../meta');

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  titles = {};

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    entity.songs = [];
    titles[slug] = entity.title;

    //TODO Check to see if there is a filter (entity.filter).
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

    meta.getSongs().forEach(filter);

  });

  return {
    "all": entities,
    "titles": titles,
  }
}
