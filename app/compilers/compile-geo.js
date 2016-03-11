var fs = require("fs"),
    meta = require('../meta');

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  titles = {};

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    entity.artists = [];
    titles[slug] = entity.title;

    meta.getArtists().forEach(function(artist) {
      if (artist.origin === slug) {
        entity.artists.push(artist);
      }
    });

  });

  return {
    "all": entities,
    "titles": titles,
  }
}
