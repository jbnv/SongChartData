var functions = require("./functions"),
    meta = require("../app/meta"),
    scoring = require("../app/scoring");

module.exports = function(parameters,app) {

  var slugs = {};
  slugs.singularSlug = parameters.singular || parameters;
  slugs.pluralSlug = parameters.plural || slugs.singularSlug+"s";
  slugs.storageSlug = parameters.storage || slugs.singularSlug;

  app.get("/"+slugs.pluralSlug, functions.getSome(slugs));

  app.get("/"+slugs.pluralSlug+"/count/:count", functions.getSome(slugs));

  app.get("/"+slugs.pluralSlug+"/count/:count/page/:page", functions.getSome(slugs));

  app.get("/"+slugs.pluralSlug+"/titles", functions.getTitles(slugs));

  app.get("/"+slugs.pluralSlug+"/scores", functions.getScores(slugs));

  var itemExpression = "^\\/"+slugs.singularSlug+"\\/([a-z0-9-]+)$";

  app.get(new RegExp(itemExpression), functions.getOne(slugs));

  //TODO PUT route - create item

  //TODO POST route - update item

  return slugs;

}
