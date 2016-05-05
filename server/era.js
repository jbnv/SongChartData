var Era = require("../lib/era"),
    functions = require("./functions"),
    meta = require("../app/meta"),
    scoring = require("../app/scoring");

require("../app/polyfill");

function _forDecade(era) {
  era.songs = meta.getCompiledObject("song","by-decade")()[era.slug] || [];
  scoring.scoreCollection.call(era);
  return era;
}

function _forYear(era) {
  era.songs = meta.getCompiledObject("song","by-year")()[era.slug] || [];
  scoring.scoreCollection.call(era);
  return era;
}

function _forMonth(era) {
  era.songs = meta.getCompiledObject("song","by-month")()[era.slug] || [];
  scoring.scoreCollection.call(era);
  return era;
}

module.exports = function(app) {

  // Decade
  app.get(/^\/era\/(\d{3}0s)$/,function(req,res) {
    console.log("GET /era",req.params[0],"(decade)");
    var decade = req.params[0];
    var outbound = _forDecade(new Era(decade));
    outbound.years = outbound.years.map(function(year) {
      return _forYear(new Era(year));
    });
    scoring.aggregateCollection.call(outbound.years);
    res.send(outbound);
  });

  // Year
  app.get(/^\/era\/(\d{4})$/,function(req,res) {
    console.log("GET /era",req.params[0],"(year)");
    var year = parseInt(req.params[0]);
    var outbound = _forYear(new Era(year));
    outbound.months = outbound.months.map(function(month) {
      return _forMonth(new Era(month));
    });
    res.send(outbound);
  });

  // Month
  app.get(/^\/era\/(\d{4}-\d{2})$/,function(req,res) {
    console.log("GET /era",req.params[0],"(month)");
    var slug = req.params[0];
    var outbound = _forMonth(new Era(slug));
    res.send(outbound);
  });

  // Catch-all for bad patterns.
  app.get(/^\/era\/(.+)$/,function(req,res) {
    console.log("GET /era",req.params[0],"(bad pattern)");
    res.status(404).send("era: Bad slug '"+req.params[0]+"'.");
  });

  app.get("/eras",function(req,res) {

    var outbound = {
      decades: {},
      years: {},
      months: {}
    };

    var keys = [];

    var decades = meta.getCompiledObject("song","by-decade")();
    keys = Object.keys(decades);
    keys.forEach(function(key) {
      var scoreEntity = {songs:decades[key]};
      scoreEntity.songCount = decades[key].length;
      scoring.scoreCollection.call(scoreEntity);
      delete scoreEntity.songs;
      outbound.decades[key] = scoreEntity;
    });
    decadeArray = keys.map(function(key) { return outbound.decades[key]; })
    scoring.aggregateCollection.call(decadeArray);

    var years = meta.getCompiledObject("song","by-year")();
    keys = Object.keys(years);
    keys.forEach(function(key) {
      var scoreEntity = {songs:years[key]};
      scoreEntity.songCount = years[key].length;
      scoring.scoreCollection.call(scoreEntity);
      delete scoreEntity.songs;
      outbound.years[key] = scoreEntity;
    })
    yearArray = keys.map(function(key) { return outbound.years[key]; })
    scoring.aggregateCollection.call(yearArray);

    var months = meta.getCompiledObject("song","by-month")();
    Object.keys(months).forEach(function(key) {
      var scoreEntity = {songs:months[key]};
      scoreEntity.songCount = months[key].length;
      scoring.scoreCollection.call(scoreEntity);
      delete scoreEntity.songs;
      outbound.months[key] = scoreEntity;
    })

    res.send(outbound);
  })

}
