var meta = require("../app/meta");

//require("./app/polyfill");

module.exports = function(app) {

  function _songs(options) {
    return meta.getCompiledCollection("song",options)();
  }

  app.get("/songs", function(req, res) {
    console.log("GET /songs");
    res.send(_songs());
  });

  app.get(/^\/songs\/count\/(\d+)$/, function(req, res) {
    console.log("GET "+req.originalUrl);
    var count = parseInt(req.params[0]);
    res.send(_songs().slice(0,count));
  });

  app.get(/^\/songs\/count\/(\d+)\/page\/(\d+)$/, function(req, res) {
    var count = parseInt(req.params[0]);
    var page = parseInt(req.params[1]);
    console.log("GET "+req.originalUrl,count,page);
    res.send(_songs().slice(count*(page-1),count*page));
  });

  function _isUnranked(song) {
    if (song.ranks === true) return true;
    return (song.ranks || []).length == 0;
  }

  app.get("/songs/unranked", function(req, res) {
    console.log("GET /songs/unranked");
    res.send(_songs().filter(_isUnranked).sort(transform.sortByTitle));
  });

  function _song(slug,expand) {
    return meta.getCompiledObject("song",slug)();
  }

  app.get(/^\/song\/(.+)$/, function(req, res) {
    console.log("GET /song",req.params[0]);
    var slug = req.params[0];
    res.send(_song(slug,true));
  });

}
