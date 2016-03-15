var meta = require('../meta'),
    scoring = require("../scoring");

require("../polyfill");

function transformArtist(artist,slug,roleSlug) {
  return { slug: slug, title: artist.title, roleSlug: roleSlug };
}

// entities: array of entities of the type
module.exports = function(yargs,entities) {

  allArtists = meta.getArtists();
  allGenres = meta.getGenres();
  allPlaylists = meta.getPlaylists();

  titles = {};

  entities.forEach(function(entity) {
    //console.log(entity.instanceSlug,entity.title);

    titles[entity.instanceSlug] = entity.title;

    scoring.score(entity);

    if (entity.genre && !entity.genres) { entity.genres = [entity.genre]; }
    if (entity.playlist && !entity.playlists) { entity.playlists = [entity.playlist]; }

    if (entity.artists) {
      entity.artists = entity.artists.expand(allArtists,transformArtist);
    } else {
       entity.artists = [];
    }

    if (entity.genres) {
      entity.genres = entity.genres.expand(allGenres);
    } else {
       entity.genres = [];
    }

    if (entity.playlists) {
      entity.playlists = entity.playlists.expand(allPlaylists);
    } else {
       entity.playlists = [];
    }

    //console.log(entity);
  });

  return {
    "all": entities,
    "titles": titles,
  }
}
