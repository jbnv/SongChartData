var Era = require("../lib/era"),
    functions = require("./functions"),
    meta = require("../app/meta"),
    scoring = require("../app/scoring");

require("../app/polyfill");

function _forDecade(decade) {
  var songs = meta.getCompiledObject("song","by-decade")()[decade] || [];
  var outbound = {slug:decade, songs: songs};
  scoring.scoreCollection.call(outbound);
  return outbound;
}

function _forYear(year) {
  var songs = meta.getCompiledObject("song","by-year")()[year] || [];
  var outbound = {slug: year, songs: songs};
  scoring.scoreCollection.call(outbound);
  return outbound;
}

function _forMonth(month) {
  var songs = meta.getCompiledObject("song","by-month")()[month] || [];
  var outbound = {slug: month, songs: songs};
  scoring.scoreCollection.call(outbound);
  return outbound;
}

module.exports = function(app) {

  // Decade
  app.get(/^\/era\/(\d{3}0s)$/,function(req,res) {
    console.log("GET /era",req.params[0],"(decade)");
    var decade = req.params[0];
    var era = new Era(decade);
    var outbound = _forDecade(decade);
    outbound.years = era.years.map(_forYear);
    res.send(outbound);
  });

  // Year
  app.get(/^\/era\/(\d{4})$/,function(req,res) {
    console.log("GET /era",req.params[0],"(year)");
    var year = parseInt(req.params[0]);
    var era = new Era(year);
    var outbound = _forYear(year);
    outbound.months = era.months.map(_forMonth);
    res.send(outbound);
  });

  // Month
  app.get(/^\/era\/(\d{4}-\d{2})$/,function(req,res) {
    console.log("GET /era",req.params[0],"(month)");
    var content = meta.getCompiledObject("song","by-month")();
    res.send(content[req.params[0]] || []);
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

    var decades = meta.getCompiledObject("song","by-decade")();
    Object.keys(decades).forEach(function(key) {
      var scoreEntity = {songs:decades[key]};
      scoreEntity.songCount = decades[key].length;
      scoring.scoreCollection.call(scoreEntity);
      delete scoreEntity.songs;
      outbound.decades[key] = scoreEntity;
    });

    var years = meta.getCompiledObject("song","by-year")();
    Object.keys(years).forEach(function(key) {
      var scoreEntity = {songs:years[key]};
      scoreEntity.songCount = years[key].length;
      scoring.scoreCollection.call(scoreEntity);
      delete scoreEntity.songs;
      outbound.years[key] = scoreEntity;
    })

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
