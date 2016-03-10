var fs = require("fs"),
    meta = require('../meta');

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  titles = {};

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    entity.songs = [];
    titles[slug] = entity.title;

    meta.getSongs().forEach(function(song) {
      if (song.source === slug) {
        entity.songs.push(song);
      }
    });

  });

  return {
    "all": entities,
    "titles": titles,
  }
}
