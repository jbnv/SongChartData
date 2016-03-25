var fs   = require('graceful-fs'),
    fsq = require("../lib/fs"),
    meta = require("../app/meta"),
    path = require('path'),
    q = require("q");

//require("./app/polyfill");

module.exports = function(app) {

  app.get("/summary", function(req,res) {
    console.log("GET /summary");

    var promises = meta.entityTypes
      .map(function(entityType) {
        var entityPath = path.join("raw",entityType);
        return fsq.readDir(entityPath).then(function(listing) { return {slug: entityType, count: listing.length}; });
      });

    q.all(promises)
      .then(function(entityCounts) {
        var outbound = {};
        entityCounts.forEach(function(entry) { outbound[entry.slug] = entry.count; });
        res.send(outbound);
      })
      .catch(function (error) {
        res.send({"error":error});
      })
    ;

  });


}
