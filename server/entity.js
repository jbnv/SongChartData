var meta = require("../app/meta"),
    scoring = require("../app/scoring");

module.exports = function(parameters,app) {

  var singularSlug = parameters.singular || parameters;
  var pluralSlug = parameters.plural || singularSlug+"s";
  var storageSlug = parameters.storage || singularSlug;

  app.get("/"+pluralSlug, function(req, res) {
    console.log("GET /"+pluralSlug);
    content = meta.getCompiledCollection(storageSlug)();
    res.send(content);
  });

  app.get("/"+pluralSlug+"/titles", function(req, res) {
    console.log("GET /"+pluralSlug+"/titles");
    content = meta.getCompiledCollection(storageSlug)();
    var outbound = {};
    content.forEach(function(item) { outbound[item.instanceSlug] = item.title; });
    res.send(outbound);
  });

  app.get("/"+pluralSlug+"/scores", function(req, res) {
    console.log("GET /"+pluralSlug+"/scores");
    content = meta.getCompiledCollection(storageSlug)();
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
  });

  var itemExpression = "^\\/"+singularSlug+"\\/(.+)$";

  app.get(new RegExp(itemExpression), function(req, res) {
    console.log("GET /"+singularSlug,req.params[0]);
    var itemSlug = req.params[0];
    content = meta.getCompiledObject(storageSlug,itemSlug)();
    res.send(content);
  });

  //TODO PUT route - create item

  //TODO POST route - update item

}
