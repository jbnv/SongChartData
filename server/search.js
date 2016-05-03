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

    if (/^\d\d\d0s$/.test(substring)) {
      outbound.push({
        title: substring,
        typeSlug: "decade",
        route: "decade/"+substring
      });
    } else if (/^\d\d\d\d$/.test(substring)) {
      outbound.push({
        title: substring,
        typeSlug: "year",
        route: "year/"+substring
      });
    } else if (/^\d\d\d\d-\d\d$/.test(substring)) {
      outbound.push({
        title: substring,
        typeSlug: "month",
        route: "month/"+substring        
      });
    }

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
          entity.route = ""+storageSlug+"/"+entity.instanceSlug;
          outbound.push(entity);
        }
      }); // entities
    }); // storageSlugs

    res.send(outbound.sort(transform.sortByScore));

  }); // /search/:substring

};
