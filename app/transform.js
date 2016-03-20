// Methods for sorting, filtering and transforming data for display.
// This file should be the same between the data and the app.

exports.sortByTitle = function(a,b) {
  return a.title < b.title ? -1 : 1;
}

exports.sortByScore = function(a,b) {
  return (b.score || 0) - (a.score || 0);
}

exports.sortBySongCount = function(a,b) {
  return (b.songs || []).length - (a.songs || []).length;
}

exports.sortByArtistCount = function(a,b) {
  return (b.artists || []).length - (a.artists || []).length;
}

exports.sortBySongAdjustedAverage = function(a,b) {
  return (b.songAdjustedAverage || 0) - (a.songAdjustedAverage || 0);
}

exports.sortByArtistAdjustedAverage = function(a,b) {
  return (b.artistAdjustedAverage || 0) - (a.artistAdjustedAverage || 0);
}
