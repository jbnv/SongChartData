var meta = require("../app/meta"),
    scoring = require("../app/scoring");

exports.getOne = function(slugs,filterFn) {

  return function(req, res) {
    console.log("GET "+req.originalUrl);
    var itemSlug = req.params[0];
    content = meta.getCompiledObject(slugs.storageSlug,itemSlug)();
    if (filterFn) {
      content = content.filter(filterFn);
    }
    res.send(content);
  };

}

exports.getSome = function(slugs,filterFn,sortFn) {

  return function(req, res) {
    console.log("GET "+req.originalUrl);
    var parameters = req.params;
    parameters.filterFn = filterFn;
    parameters.sortFn = sortFn;
    content = meta.getCompiledCollection(slugs.storageSlug,parameters)();
    res.send(content);
  };

}

exports.getTitles = function(slugs) {

  return function(req, res) {
    console.log("GET "+req.originalUrl);
    content = meta.getCompiledCollection(slugs.storageSlug)();
    var outbound = {};
    content.forEach(function(item) { outbound[item.instanceSlug] = item.title; });
    res.send(outbound);
  };

}

exports.getScores = function(slugs) {

  return function(req, res) {
    console.log("GET "+req.originalUrl);
    content = meta.getCompiledCollection(slugs.storageSlug)();
    res.send(content.map(function(item) {
      var outbound = {};
      outbound.slug = item.instanceSlug;
      outbound.title = item.title;
      outbound.score = item.score;
      if (item.songs) {
        outbound.songCount = item.songs.length;
        outbound.songAdjustedAverage = scoring.adjustedAverage(item.score,item.songs.length);
      }
      if (item.artists) {
        outbound.artistCount = item.artists.length;
        outbound.artistAdjustedAverage = scoring.adjustedAverage(item.score,item.artists.length);
      }
      return outbound;
    }));
  };

}
