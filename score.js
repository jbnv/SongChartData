var chalk       = require("chalk"),
    fs          = require("graceful-fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),
    yargs       = require('yargs'),

    writeEntity = require("./lib/fs").writeEntity,

    meta        = require('./app/meta'),
    scoring     = require('./app/scoring');

function read(slug) {
  try {
    var song = meta.getRawObject("song",slug)();
    scoring.score(song);
    return song;
  } catch(err) {
    return {};
  }
}

function write(slug,entity) {
  writeEntity(meta.rawRoute("song",slug),entity);
}

function unary(task,fn) {
  return function(slug) {
    var entity = read(slug);
    fn(entity);
    write(slug,entity);

    util.log(
      chalk.green(task),
      chalk.blue(slug),
      entity.title
    );
  }
}

function swap(pair) {

  var a = pair.split(",")[0];
  var b = pair.split(",")[1];

  var entityA = read(a);
  var entityB = read(b);

  var temp = entityA.scores;
  entityA.scores = entityB.scores;
  entityB.scores = temp;

  write(a,entityA);
  write(b,entityB);

  util.log(
    chalk.green("swap"),
    chalk.blue(a),
    entityA.title
  );
  util.log(
    chalk.green("swap"),
    chalk.blue(b),
    entityB.title
  );
}

function interpolate(tuple) {

  var slugs = tuple.split(",");
  var songs = slugs.map(read);
  if (slugs.length == 1) return;

  newScores = [];

  songs.slice(1).forEach(function(song) {
    for (var i in song.scores) {
      if (newScores.length < i+1) {
        newScores.push(song.scores[i] || 0);
      } else {
        newScores[i] += song.scores[i] || 0;
      }
    }
  });

  for (var i in newScores) {
    newScores[i] = newScores[i] / (slugs.length-1);
  }

  songs[0].scores = newScores;
  write(slugs[0],songs[0]);

  util.log(
    chalk.green("interpolate"),
    chalk.blue(slugs[0]),
    songs[0].title
  );
}

var clear = unary(
  "clear",
  function(entity) { entity.scores = []; }
);

var zero = unary(
  "zero",
  function(entity) { entity.scores = [0]; }
);

var bendUp = unary(
  "up",
  function(entity) {
    entity.scores = entity.scores.map(function(score) {
      return 2*score/(score+1);
    });
  }
);

var bendDown = unary(
  "down",
  function(entity) {
    entity.scores = entity.scores.map(function(score) {
      return score/(2-score);
    });
  }
);

function processArguments(flag,fn) {
  arg = yargs.argv[flag];
  if (arg) {
    if (arg.constructor === Array) {
      arg.forEach(fn);
    } else {
      fn(arg);
    }
  }
}

processArguments("s",swap);
processArguments("i",interpolate);
processArguments("c",clear);
processArguments("z",zero);
processArguments("u",bendUp);
processArguments("d",bendDown);

if (yargs.argv.all) {

  var songs = meta.getSongs();
  var artists = meta.getArtists();
  var artistsTransformedCount = 0;
  var songsTransformedCount = 0;

  util.log("Processing",songs.length ,"by",artists.length,"artists.");

  var unscoredSongs = [];
  var scoredSongCount = 0;
  var newScores = [];

  songs.forEach(function(song) {

    if (!song.scores || song.scores.length == 0) {
      unscoredSongs.push(song);
      return;
    }

    scoredSongCount++;

    for (i = 0; i < song.scores.length; i++) {
      if (newScores.length < i+1) {
        newScores.push(song.scores[i]);
      } else {
        newScores[i] += song.scores[i];
      }
    }

  });

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

  util.log(
    "Scored",
    chalk.green(songsTransformedCount),
    "unscored songs."
  );

}
