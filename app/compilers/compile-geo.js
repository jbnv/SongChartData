var chalk       = require("chalk"),
    fs          = require("fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),

    meta        = require('../meta'),
    scoring     = require('../scoring');

//require("../polyfill");

function round00(n) {
  return Math.round(parseFloat(n)*100)/100;
}

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  util.log(chalk.magenta("compile-geo.js"));
  titles = {};

  util.log("Caching artists and scores...");
  var locationArtists = {};
  var locationScores = {};
  meta.getArtists().forEach(function(artist) {
    var slug = artist.origin;
    if (!locationArtists[slug]) { locationArtists[slug] = []; locationScores[slug] = 0.0; }
    locationArtists[slug].push(artist);
    if (artist.score) {
      try {
        locationScores[slug] += parseFloat(artist.score);
      } catch(error) {
      }
    }
  });
  util.log("Cache complete.");

  entities.forEach(function(entity) {
    var slug = entity.instanceSlug;
    util.log(chalk.blue(entity.instanceSlug),entity.title);

    titles[slug] = entity.title;

    entity.artists = locationArtists[slug];
    entity.score = round00(locationScores[slug]);

    if (entity.artists && entity.artists.length > 0) {
      entity.artistAdjustedAverage = round00(entity.score / Math.sqrt(entity.artists.length));
    }

  });

  return {
    "all": entities,
    "titles": titles,
  }
}
