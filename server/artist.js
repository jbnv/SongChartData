var meta = require("../app/meta");

//require("./app/polyfill");

module.exports = function(app) {

  function _artists(options) {
    return meta.getCompiledCollection("artist",options)();
  }

  app.get("/artists", function(req, res) {
    console.log("GET /artists");
    res.send(_artists());
  });

  app.get("/artists/incomplete", function(req, res) {
    console.log("GET /artists/incomplete");
    var result = _artists().filter(function(artist) { return !artist.complete; }).sort(transform.sortByTitle);
    res.send(result);
  });

  function _artist(slug) {
    return meta.getCompiledObject("artist",slug)();
  }

  app.get(/^\/artist\/(.+)$/, function(req, res) {
    console.log("GET /artist",req.params[0]);
    var slug = req.params[0];
    res.send(_artist(slug,true));
  });

  app.get("/artist-types", function(req, res) {
    console.log("GET /artist-types");

    var artists = _artists();
    var map = require("./app/models/artist-types");

    artists.forEach(function(artist) {
      var type = artist.type || "";
      if (!map[type]) {
        console.log("Unrecognized type '"+type+"'");
        type = "u";
      }
      map[type].artists.push(artist);
    });

    var outbound = transform.objectToArray(map);
    outbound.forEach(function(type) { scoring.scoreCollection.call(type); });
    res.send(outbound);
  });

  app.get(/^\/artist-type\/(.+)$/, function(req, res) {
    console.log("GET /artist-type",req.params[0]);
    var slug = req.params[0];
    var map = require("./app/models/artist-types");
    var artists = _artists().filter(function(artist) { return artist.type && artist.type.slug === slug; });
    res.send({
      title: map[slug].title,
      artists: artists
    });
  });

}
