var meta = require("../app/meta");

module.exports = function(parameters,app) {

  var singularSlug = parameters.singular || parameters;
  var pluralSlug = parameters.plural || singularSlug+"s";
  var storageSlug = parameters.storage || singularSlug;

  app.get("/"+pluralSlug, function(req, res) {
    console.log("GET /"+pluralSlug);
    content = meta.getCompiledCollection(storageSlug)();
    res.send(content);
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
