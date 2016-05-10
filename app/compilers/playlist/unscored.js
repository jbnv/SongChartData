exports.match = function(song) {
  return !song.scores || song.scores.length == 0;
}
