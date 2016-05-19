var functions = require("./functions"),
    meta = require("../app/meta"),
    transform = require("../app/transform");

module.exports = function(app) {

  var slugs = require("./entity")("song",app);

  function _isUnscored(song) {
    if (song.scores === true) return true;
    return (song.scores || []).length == 0;
  }

  app.get("/songs/unscored", functions.getSome(slugs,_isUnscored,transform.sortByTitle));

  function _withMessages(song) {
    return (song.messages || []).length > 0;
  }

  app.get("/songs/with-messages", functions.getSome(slugs,_withMessages));

}
