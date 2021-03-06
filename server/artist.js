var functions = require("./functions"),
    meta = require("../app/meta"),
    scoring = require("../app/scoring"),
    transform = require("../app/transform");

//require("./app/polyfill");

module.exports = function(app) {

  function _artists() {
    return meta.getCompiledCollection("artist")();
  }

  function _artist(slug) {
    return _transform(meta.getCompiledObject("artist",slug)());
  }

  function _transform(artist) {
    var expandSongFn = require("../app/expanders/song");
    artist.songs = artist.songs.map(expandSongFn);
    return artist;
  }

  var options = {
    functions: {
      transform: _transform
    }
  };

  var slugs = require("./entity")("artist",app,options);

  app.get(/^\/artist\/(.+)\/songs$/, function(req, res) {
    console.log("GET /artist",req.params[0],"songs");
    var itemSlug = req.params[0];
    res.send(_artist(itemSlug).songs);
  });

  app.get("/artists/complete", functions.getSome(
    slugs,
    function(artist) { return artist.complete; },
    transform.sortByTitle
  ));

  app.get("/artists/incomplete", functions.getSome(
    slugs,
    function(artist) { return !artist.complete; },
    transform.sortByTitle
  ));

  app.get("/artists/active", functions.getSome(
    slugs,
    function(artist) { return artist.active; },
    transform.sortByTitle
  ));

  app.get("/artists/unscored", functions.getSome(
    slugs,
    function(artist) { return !artist.score; },
    transform.sortBySongCount
  ));

  app.get("/artists/by-genre/:slug",
    functions.getSomeByDetailSlug(slugs,"genres")
  );

  app.get("/artist-types", function(req, res) {
    console.log("GET /artist-types");

    var artists = _artists();
    var map = require("../app/models/artist-types");

    artists.forEach(function(artist) {
      var type = (artist.type || {}).slug || "";
      if (!map[type]) {
        console.log("Unrecognized type '"+type+"'");
        type = "u";
      }
      map[type].artistCount++;
      //map[type].artists.push(artist);
      map[type].score += artist.score;
    });

    var outbound = transform.objectToArray(map);
    outbound.forEach(function(type) {
      type.artistAdjustedAverage = scoring.adjustedAverage(type.score,type.artistCount);
    });
    res.send(outbound);
  });

  app.get(/^\/artist-type\/(.+)$/, function(req, res) {
    console.log("GET /artist-type",req.params[0]);
    var slug = req.params[0];
    var map = require("../app/models/artist-types");
    var artists = _artists().filter(function(artist) { return artist.type && artist.type.slug === slug; });
    res.send({
      title: map[slug].title,
      artists: artists
    });
  });

}
