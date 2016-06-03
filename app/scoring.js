// Middleware for scoring and ranking.

require("./polyfill");
var transform = require("./transform");

function round000(n) {
  return Math.round(parseFloat(n)*1000)/1000;
}

function _adjustedAverage(score,count) {
  if (!count || count < 1) return null;
  return score / Math.sqrt(count);
}

exports.adjustedAverage = _adjustedAverage;

function _sortAndRank(list,sortFn) {
  if (!list) return [];
  var outbound = list.sort(sortFn || transform.sortByScore);
  outbound.forEach(function(item,index) {
    item.rank = index + 1;
  });
  return outbound;
}

exports.sortAndRank = _sortAndRank;

// Scoring criteria:
// Debut score (D): Higher score (lower number) is better.
// Peak score (P): Higher score (lower number) is better.
// Duration (M): More is better.

exports.score = function(song,scoringOptions) {

  function addMessage(msg) {

  }

	if (!scoringOptions) { scoringOptions = {}; }

  if (!song.peak)  { return; }
  song.peak = parseFloat(song.peak);

  var ascentWeeks = song["ascent-weeks"] || 0;
  var descentWeeks = song["descent-weeks"] || 0;

  song.score = (2/3) * song.peak * (ascentWeeks+descentWeeks);

	song.duration = Math.ceil(
    (ascentWeeks+descentWeeks) * 7 / 30.4375
  );

	return song;
}

// this: song collection
exports.scoreCollection = function() {

  var score = 0.0;
  if (this.songs) {
    this.songs.forEach(function(song) {
      if (song.score) {
        try {
  			  score += parseFloat(song.score);
        } catch(error) {
        }
  		}
    });
  } else if (this.artists) {
    this.artists.forEach(function(artist) {
      if (artist.score) {
        try {
  			  score += parseFloat(artist.score);
        } catch(error) {
        }
  		}
    });
  }
  this.score = score;

  if (this.songs) {
    this.songCount = this.songs.length;
    this.songAdjustedAverage = _adjustedAverage(this.score, this.songs.length);
  }

  if (this.artists) {
    this.artistCount = this.artists.length;
    this.artistAdjustedAverage = _adjustedAverage(this.score, this.artists.length);
  }

}

exports.aggregateCollection = function() {
  var that = this;
  this.maxSongCount = 0.00;
  this.maxSongAdjustedAverage = 0.00;
  this.maxArtistCount = 0.00;
  this.maxArtistAdjustedAverage = 0.00;

  this.forEach(function(item) {
    if (item.songCount > that.maxSongCount) {
      that.maxSongCount = item.songCount;
    }
    if (item.songAdjustedAverage > that.maxSongAdjustedAverage) {
      that.maxSongAdjustedAverage = item.songAdjustedAverage;
    }
    if (item.artistCount > that.maxArtistCount) {
      that.maxArtistCount = item.artistCount;
    }
    if (item.artistAdjustedAverage > that.maxArtistAdjustedAverage) {
      that.maxArtistAdjustedAverage = item.artistAdjustedAverage;
    }
  });

  // Calculate fractions.
  if (this.maxSongCount) {
    this.forEach(function(item) {
      item.songCountScale = 1.0*item.songCount / that.maxSongCount;
    });
  }
  if (this.maxSongAdjustedAverage) {
    this.forEach(function(item) {
      item.songAdjustedAverageScale = 1.0*item.songAdjustedAverage / that.maxSongAdjustedAverage;
    });
  }
  if (this.maxArtistCount) {
    this.forEach(function(item) {
      item.artistCountScale = 1.0*item.artistCount / that.maxArtistCount;
    });
  }
  if (this.maxArtistAdjustedAverage) {
    this.forEach(function(item) {
      item.artistAdjustedAverageScale = 1.0*item.artistAdjustedAverage / that.maxArtistAdjustedAverage;
    });
  }

}

// Rank an entity list over a collection.
// For use after the list has been processed.
// entityList: List of entities that will be ranked.
// collection: Particular collection from which to get the rankings.
// prefix: A prefix to add to the slug to make the ranking slug.
exports.rankEntities = function(entityList,collection,prefix) {
  Object.keys(collection).forEach(function(listKey) {
    _sortAndRank(collection[listKey]);
    collection[listKey].forEach(function(item) {
      itemEntity = entityList.filter(function(e) {
        return e.instanceSlug === item.instanceSlug;
      })[0];
      if (itemEntity) {
        if (!itemEntity.ranks) itemEntity.ranks = {};
        itemEntity.ranks[prefix+":"+listKey] = {
          "rank":item.rank,
          "total":collection[listKey].length
        };
      }
    });
  });

}

exports.bend = function(c) {
  if (c == 0) return function(x) { return x };
  if (c > 0) return function(x) {
    return (c+1)*x/(c*x+1);
  };
  return function(x) {
    return parseFloat(x)/(1-c+c*x);
  }
}
