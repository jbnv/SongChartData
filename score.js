var chalk       = require("chalk"),
    fs          = require("graceful-fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),
    yargs       = require('yargs'),

    writeEntity = require("./lib/fs").writeEntity,

    meta        = require('./app/meta'),
    scoring     = require('./app/scoring');

Array.prototype.sum = function() {
  var result = 0;
  this.forEach(function(e) { result += parseFloat(e); });
  return result;
}

Array.prototype.stats = function() {

  var sum = 0;
  var peakValue = 0;
  var peakIndex = 0;

  this.forEach(function(e,index) {
    var f = parseFloat(e);
    sum += f;
    if (f > peakValue) { peakValue = f; peakIndex = index; }
  });

  var descent = this.slice(peakIndex);
  var descentSum = descent.sum();

  return {
    sum: sum,
    peakValue:peakValue,
    peakIndex: peakIndex,
    ascent: this.slice(0,peakIndex+1),
    descent: descent,
    descentSum: descentSum,
    normalizedDescentLength: (3/2)*(descentSum/(peakValue || 1))
  };
}

Array.prototype.normalize = function() {
  var stats = this.stats();
  var transformed = stats.ascent;
  var denominator = stats.normalizedDescentLength;
  for (i = 1; i < denominator; i++ ) {
    var tail = stats.peakValue*(1-Math.pow(i/denominator,2));
    transformed.push(tail);
  }
  return transformed;
};

function read(slug) {
  try {
    var song = meta.getRawObject("song",slug)();
    scoring.score(song);
    return song;
  } catch(err) {
    return {};
  }
}

function write(slug,song) {
  song.scores = (song.scores || []).filter(function(s) { return s >= 0.01 });
  writeEntity(meta.rawRoute("song",slug),song);
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

function unaryWithModifier(task,fn) {
  return function(slugColonModifier) {
    var split = (""+slugColonModifier).split(":"),
        slug = split[0],
        modifier = split[1],
        entity = read(slug);
    fn(entity,modifier);
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

  var scoresA = entityA.scores;
  var scoresB = entityB.scores;

  var statsA = scoresA.stats();
  var statsB = scoresB.stats();

  var transformedA = statsA.ascent;
  var transformedB = statsB.ascent;

  // Here's where the swap takes place. Swap total scores.
  var ndcA = (3/2)*(statsB.sum-transformedA.sum())/(statsA.peakValue || 1);
  var ndcB = (3/2)*(statsA.sum-transformedB.sum())/(statsB.peakValue || 1);

  for (i = 1; i < ndcA; i++ ) {
    var tail = statsA.peakValue*(1-Math.pow(i/ndcA,2));
    transformedA.push(tail);
  }

  for (i = 1; i < ndcB; i++ ) {
    var tail = statsB.peakValue*(1-Math.pow(i/ndcB,2));
    transformedB.push(tail);
  }

  entityA.scores = transformedA;
  entityB.scores = transformedB;

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
  function(entity) { entity.scores = false; }
);

// var bendUp = unaryWithModifier(
//   "up",
//   function(entity,modifier) {
//     degree = parseFloat(modifier || 0.5);
//     if (degree <= 0 || degree >= 1) return;
//     entity.scores = entity.scores.map(function(score) {
//       return score + (1-score)*degree;
//     });
//   }
// );

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

var normalize = unary(
  "normalize",
  function(entity) {
    entity.scores = entity.scores.normalize();
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
processArguments("n",normalize);
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
  var totalScore = 0.0;

  songs.forEach(function(song) {

    if (song.scores === false) {
      return;
    }

    if (!song.scores || song.scores.length == 0) {
      unscoredSongs.push(song);
      return;
    }

    stats = song.scores.stats();
    scoredSongCount++;
    totalScore += stats.sum;

  });

  var peakValue = 0.3;
  var descentSum = totalScore/scoredSongCount;

  var newScores = [peakValue];
  var denominator = (3/2)*(descentSum/(peakValue || 1));
  for (i = 1; i < denominator; i++ ) {
    var tail = peakValue*(1-Math.pow(i/denominator,2));
    newScores.push(tail);
  }

  // newScores = newScores.map(function(v) {
  //   var average = v / scoredSongCount;
  //   return average / (2-average);
  // }).normalize();

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
