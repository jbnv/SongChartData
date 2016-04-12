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

function _getSome(slugs,filterFn,sortFn) {

  return function(req, res) {
    console.log("GET "+req.originalUrl);
    var parameters = req.params;
    parameters.filterFn = filterFn;
    parameters.sortFn = sortFn;
    content = meta.getCompiledCollection(slugs.storageSlug,parameters)();
    res.send(content);
  };

}

exports.getSome = _getSome;

exports.getSomeBySubstring = function(slugs,objectSlug,sortFn) {

  return function(req, res) {
    console.log("GET "+req.originalUrl);

    var substring = (""+req.params.substring).toLowerCase();
    if (substring === "") {
      res.send([]);
      return;
    }

    var parameters = req.params;
    parameters.sortFn = sortFn;

    parameters.filterFn = function(entity) {
      return (""+entity[objectSlug]).toLowerCase().contains(substring);
    };

    content = meta.getCompiledCollection(slugs.storageSlug,parameters)();
    res.send(content);
  };

}

exports.getSomeByDetailSlug = function(slugs,objectSlug,sortFn) {

  return function(req, res) {
    console.log("GET "+req.originalUrl);
    var detailSlug = req.params.slug;
    var parameters = req.params;
    parameters.sortFn = sortFn;

    parameters.filterFn = function(entity) {
      if (entity[objectSlug]) {
        for (i in entity[objectSlug]) {
          if (entity[objectSlug][i].instanceSlug == detailSlug) return true;
        }
      }
      return false;
    };

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
