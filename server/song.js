var meta = require("../app/meta");

//require("./app/polyfill");

module.exports = function(app) {

  // For pagination, we need additional information.

  function _songs(options) {
    var songs = meta.getCompiledCollection("song",options)();

    if (!options) options = {};

    var outbound = {
      "totalCount":songs.length,
    };

    if (options.count) {
      var count = parseInt(options.count);
      var page =  parseInt(options.page || 1);
      outbound.pageSize = count;
      outbound.pageCount = Math.ceil(songs.length/count);
      outbound.currentPage = page;
      outbound.songs = songs.slice(count*(page-1),count*page);
    } else {
      outbound.songs = songs;
    }

    return outbound;

  }

  app.get("/songs", function(req, res) {
    console.log("GET /songs");
    res.send(_songs());
  });

  app.get(/^\/songs\/count\/(\d+)$/, function(req, res) {
    console.log("GET "+req.originalUrl);
    res.send(_songs({"count":req.params[0]}));
  });

  app.get(/^\/songs\/count\/(\d+)\/page\/(\d+)$/, function(req, res) {
    console.log("GET "+req.originalUrl);
    res.send(_songs({"count":req.params[0],"page":req.params[1]}));
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
