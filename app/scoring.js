// Middleware for scoring and ranking.

require("./polyfill");
var transform = require("./transform");

function round00(n) {
  return Math.round(parseFloat(n)*100)/100;
}

exports.sortAndRank = function(songArray) {
  if (!songArray) return [];
  var outbound = songArray.sort(transform.sortByScore);
  outbound.forEach(function(song,index) {
    song.rank = index + 1;
  });
  return outbound;
}

// Scoring criteria:
// Debut rank (D): Higher rank (lower number) is better.
// Peak rank (P): Higher rank (lower number) is better.
// Duration (M): More is better.

exports.score = function(song,scoringOptions) {

  function addMessage(msg) {

  }

	if (!scoringOptions) { scoringOptions = {}; }

	// Now we always assume that .ranks, if populated, is proper JSON
	// in the following format: [ debutRank, ascentRank{0,}, peakRank, ...]
	// Ranks are projected geometrically from the final two ranks.

  var rawRanks = song.ranks;
	if (!rawRanks) return;
  if (!Array.isArray(rawRanks)) return;
  if (rawRanks.length == 0) return;

  song.ranks = [];

	// Look for embedded arrays.
	// [ number ]: Hold at the previous rank for <number> weeks.
	// [ increment, number ]: Apply <increment> to the rank for <number> weeks.
	previousRank = NaN;
	rawRanks.forEach(function(currentRank,index) {
		if ((index = 0) || (isNaN(previousRank))) { // these should always be both true or both false
			song.ranks.push(currentRank);
			previousRank = currentRank;
		} else if (Array.isArray(currentRank)) {
			switch (currentRank.length()) {
				case 1: // [ count ]
					count = currentRank[0];
					for (i = 0; i < count; i++) {
						song.ranks.push(previousRank);
					}
					break;
				case 2: // [ increment, count ]
					increment = currentRank[0];
					count = currentRank[1];
					rank = previousRank;
					for (i = 0; i < count; i++) {
						rank += increment;
						song.ranks.push(rank);
					}
					previousRank = rank;
					break;
				// anything else: do nothing (invalid)
			}
		} else {
			song.ranks.push(currentRank);
			previousRank = currentRank;
		}
	}); // rawRanks.forEach

	song.debutRank = parseFloat(song.ranks[0]);

  song.peakRank = song.ranks.reduce(function(prev,cur) {
    return !prev || prev > cur ? cur : prev;
  },null);

	if (!scoringOptions.noProjectOut) {
		rank0 = parseFloat(song.ranks[song.ranks.length-1]);
		rank1 = parseFloat(song.ranks[song.ranks.length-2]) || rank0;
		scale = rank0/rank1;
    //console.log("rank0,rank1,scale",rank0,rank1,scale);
		if (scale < 1.25) { scale = 1.25; } // prevent slow descents

		while (!((rank0 > 50) && (song.ranks.length % 4 == 0))) {
			rank0 *= scale;
			song.ranks.push(round00(rank0));
		}
	}

	song.duration = song.ranks.length/4;

	// Calculate score from point ranks.
	song.score = 0;
	for (var index in song.ranks) {
		S = Math.log(song.ranks[index]);
		if (S < 3) { song.score += (3-S); }
	}
	song.score = round00(song.score);

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
  this.score = round00(score);

  if (this.songs && this.songs.length > 0) {
    this.songAdjustedAverage = round00(this.score / Math.sqrt(this.songs.length));
  }

  if (this.artists && this.artists.length > 0) {
    this.artistAdjustedAverage = round00(this.score / Math.sqrt(this.artists.length));
  }

}
