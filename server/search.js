var functions = require("./functions"),
    meta = require("../app/meta"),
    scoring = require("../app/scoring"),
    transform = require("../app/transform");

module.exports = function(app) {

  app.get("/search/:substring", function(req, res) {
    console.log("GET "+req.originalUrl);

    var substring = (""+req.params.substring).toLowerCase();
    if (substring === "") {
      res.send([]);
      return;
    }

    var outbound = [];

    var storageSlugs = [
      "artist","genre","geo","playlist","song","source","tag"
    ];

    storageSlugs.forEach(function(storageSlug) {
      entities = meta.getCompiledObject(storageSlug,"all")() || [];
      entities.forEach(function(entity) {
        var isMatch = false;
        if (entity.searchTerms) {
          isMatch = entity.searchTerms.contains(substring);
        }
        isMatch = isMatch
          || (""+entity.title).toLowerCase().contains(substring);
        if (isMatch) {
          entity.typeSlug = storageSlug;
          outbound.push(entity);
        }
      }); // entities
    }); // storageSlugs

    res.send(outbound.sort(transform.sortByScore));

  }); // /search/:substring

};
