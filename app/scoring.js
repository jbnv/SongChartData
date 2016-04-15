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

	// Now we always assume that .scores, if populated, is proper JSON
	// in the following format: [ debutScore, ascentScore{0,}, peakScore, ...]
  // Assume that all scores are in the range {0,1].
	// Scores are projected from the final two scores.

  var rawScores = song.scores;
  song.score = null;
	if (!song.scores)  { song.scores = null; return; }
  if (!Array.isArray(song.scores)) { song.scores = null; return; }
  if (song.scores.length == 0)  { song.scores = null; return; }

	song.debutScore = parseFloat(song.scores[0]);

  song.peakScore = song.scores.reduce(function(prev,cur) {
    return !prev || prev < cur ? cur : prev;
  },null);

	if (!scoringOptions.noProjectOut) {
		score0 = parseFloat(song.scores[song.scores.length-1]);
		score1 = parseFloat(song.scores[song.scores.length-2]) || score0;
		scale = score0-score1;
    if (scale < .005) scale = .005;  // prevent infinite loops
    margin = scale;

		while (score0 > 0 ) {
			score0 -= scale;
      scale += margin;
      if (score0 < 0) score0 = 0;
			song.scores.push(round000(score0));
		}
	}

	song.duration = Math.ceil(song.scores.length/4);

	// Calculate score from point scores.
	song.score = 0;
  song.scores.forEach(function(s) { song.score += s; });

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
