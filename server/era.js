var functions = require("./functions"),
    meta = require("../app/meta"),
    scoring = require("../app/scoring");

require("../app/polyfill");

module.exports = function(app) {

  // Decade
  app.get(/^\/era\/(\d{3}0)s$/,function(req,res) {
    console.log("GET /era",req.params[0],"(decade)");
    var decade = parseInt(req.params[0]);
    var content = meta.getCompiledObject("song","by-decade")();
    res.send(content[decade] || []);
  });

  // Year
  app.get(/^\/era\/(\d{4})$/,function(req,res) {
    console.log("GET /era",req.params[0],"(year)");
    var year = parseInt(req.params[0]);
    var content = meta.getCompiledObject("song","by-year")();
    res.send(content[year] || []);

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
      outbound.decades[key] = decades[key].length;
    });

    var years = meta.getCompiledObject("song","by-year")();
    Object.keys(years).forEach(function(key) {
      outbound.years[key] = years[key].length;
    })

    var months = meta.getCompiledObject("song","by-month")();
    Object.keys(months).forEach(function(key) {
      outbound.months[key] = months[key].length;
    })

    res.send(outbound);
  })

}
