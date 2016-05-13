var chalk       = require("chalk"),
    q           = require("q"),
    util        = require("gulp-util"),
    yargs       = require('yargs'),

    writeEntity = require("./lib/fs").writeEntity,

    meta        = require('./app/meta');

function scoredUnscored() {

  var deferred = q.defer();

  var artists = meta.getArtists();
  var artistsTransformedCount = 0;
  var songsTransformedCount = 0;

  util.log(chalk.magenta("score-unscored.js"),typeSlug);
  util.log("Processing",artists.length,"artists.");

  artists.forEach(function(artist) {

    if (!artist.songs) return;

    var unscoredSongs = [];
    var scoredSongCount = 0;
    var newScores = [];

    artist.songs.forEach(function(song) {

      if (!song.scores || song.scores.length == 0) {
        //TEMP console.log("[27]",song.title,"unscored");
        unscoredSongs.push(song);
        return;
      }

      scoredSongCount++;
      //TEMP console.log("[33]",song.title,"scored");

      for (i = 0; i < song.scores.length; i++) {
        if (newScores.length < i+1) {
          newScores.push(song.scores[i]);
        } else {
          newScores[i] += song.scores[i];
        }
      }

    });

    if (scoredSongCount == 0) return; // no songs to transform
    if (unscoredSongs.length == 0) return; // no songs to transform

    util.log(
      chalk.blue(artist.instanceSlug),
      artist.title,
      chalk.gray(artist.songs.length),
      chalk.gray(scoredSongCount),
      chalk.gray(unscoredSongs.length)
    );

    artistsTransformedCount++;
    songsTransformedCount += unscoredSongs.length;

    for (var i in newScores) {
      var average = newScores[i] / scoredSongCount;
      newScores[i] = average / (2-average);
    }

    unscoredSongs.forEach(function(song) {
      var rawSong = meta.getRawObject("song",song.instanceSlug)();
      rawSong.scores = newScores;
      writeEntity(meta.rawRoute("song",song.instanceSlug),rawSong);

      util.log(
        chalk.gray("-"),
        chalk.blue(song.instanceSlug),
        song.title
      );
    });

  });

  util.log(
    "Scored",
    chalk.green(songsTransformedCount),
    "unscored songs for",
    chalk.green(artistsTransformedCount),
    "artists."
  );

  return deferred.promise;
}

var compile = require('./app/compile');

compile("song")
.then(function() { compile("artist"); })
.then(scoredUnscored)
.then(function() { compile("song"); })
.then(function() { compile("artist"); })
.catch(function (error) {
  util.log(
    chalk.red("ERROR"),
    error
  );
})
.done()
;
