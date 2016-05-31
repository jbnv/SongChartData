var chalk       = require("chalk"),
    fs          = require("graceful-fs"),
    path        = require("path"),
    q           = require("q"),
    util        = require("gulp-util"),
    yargs       = require('yargs'),

    writeEntity = require("./lib/fs").writeEntity,

    meta        = require('./app/meta'),
    scoring     = require('./app/scoring');

require('./app/polyfill');

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

  delete song.parents;
  delete song.ranks;
  delete song.debutScore;
  delete song.peakScore;
  delete song.score;
  delete song.scores;
  delete song.duration;

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

  var statsA = entityA.ascent.stats();
  var statsB = entityB.ascent.stats();

  var scoreA = entityA.ascent.score(entityA["descent-weeks"]);
  var scoreB = entityB.ascent.score(entityB["descent-weeks"]);

  // Here's where the swap takes place. Swap total scores.
  entityA["descent-weeks"] = (3/2)*(scoreB-statsA.sum)/(statsA.peakValue || 1);
  entityB["descent-weeks"] = (3/2)*(scoreA-statsB.sum)/(statsB.peakValue || 1);

  if (entityA["descent-weeks"] < 1) entityA["descent-weeks"] = 1;
  if (entityB["descent-weeks"] < 1) entityB["descent-weeks"] = 1;

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

var bendUp = unary(
  "up",
  function(entity) {
    entity.ascent = entity.ascent.map(function(score) {
      return 2*score/(score+1);
    });
  }
);

var bendDown = unary(
  "down",
  function(entity) {
    entity.ascent = entity.ascent.map(function(score) {
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
  var totalScore = 0.0;
  var ascent = [];
  var totalDescentWeeks = 0.0;

  songs.forEach(function(song) {

    if (song.ascent && !Array.isArray(song.ascent)) return;

    if (!song.ascent || song.ascent.length == 0) {
      unscoredSongs.push(song);
      return;
    }

    for (i = 0; i < song.ascent.length; i++) {
      if (ascent.length < i+1) {
        ascent.push(song.ascent[i]);
      } else {
        ascent[i] += song.ascent[i];
      }
    }

    scoredSongCount++;
    totalDescentWeeks += song["descent-weeks"];

  });

  // Reduce ascent array to an average.
  // Truncate ascent to its
  var peakValue = 0;
  var peakIndex = 0;

  ascent.forEach(function(e,index) {
    var f = parseFloat(e) / scoredSongCount;
    ascent[index] = f;
    if (f > peakValue) { peakValue = f; peakIndex = index; }
  });

  ascent = ascent.slice(0,peakIndex+1);
  var descentWeeks = 1.0 * totalDescentWeeks / scoredSongCount;
  if (descentWeeks < 1) descentWeeks = 1;
  console.log("[231]",totalDescentWeeks,scoredSongCount);

  unscoredSongs.forEach(function(song) {
    rawSong = read(song.instanceSlug);
    rawSong.ascent = ascent;
    rawSong["descent-weeks"] = descentWeeks;
    write(song.instanceSlug,rawSong);

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
