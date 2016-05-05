var chalk       = require("chalk"),
    fs          = require("fs"),
    numeral     = require("numeral"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),

    meta        = require('../meta'),
    scoring     = require('../scoring');

//require("../polyfill");

// entities: array of entities of the type
module.exports = function(yargs,entities) {
  util.log(chalk.magenta("compile-geo.js"));
  titles = {};

  util.log("Caching artists and scores...");
  var locationArtists = {};
  var locationScores = {};
  meta.getArtists().forEach(function(artist) {
    var slug = artist.origin;
    if (!locationArtists[slug]) { locationArtists[slug] = []; }
    if (!locationScores[slug]) { locationScores[slug] = 0.0; }
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

    titles[slug] = entity.title;

    entity.artists = locationArtists[slug] || [];
    entity.score = locationScores[slug];

    if (entity.artists && entity.artists.length > 0) {
      entity.artistAdjustedAverage = scoring.adjustedAverage(entity.score,entity.artists.length);
    }

    numeral.zeroFormat("");

    util.log(
      chalk.blue(entity.instanceSlug),
      entity.title,
      chalk.gray(numeral(entity.artists.length).format("0")),
      chalk.gray(numeral(entity.score || 0).format("0.00")),
      chalk.gray(numeral(entity.artistAdjustedAverage || 0).format("0.00"))
    );

  });

  return {
    "all": entities,
    "titles": titles,
  }
}
