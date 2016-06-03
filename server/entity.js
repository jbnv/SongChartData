var functions = require("./functions"),
    meta = require("../app/meta"),
    scoring = require("../app/scoring");

/*
options: {
  functions : {
    transform: function for transforming an entity;
    plural
  }
}
*/

module.exports = function(parameters,app,options) {

  options = options || {};
  options.functions = options.functions || {};

  var slugs = {};
  slugs.singularSlug = parameters.singular || parameters;
  slugs.pluralSlug = parameters.plural || slugs.singularSlug+"s";
  slugs.storageSlug = parameters.storage || slugs.singularSlug;

  app.get("/"+slugs.pluralSlug, functions.getSome(slugs));

  app.get("/"+slugs.pluralSlug+"/count/:count", functions.getSome(slugs));

  app.get("/"+slugs.pluralSlug+"/count/:count/page/:page", functions.getSome(slugs));

  app.get("/"+slugs.pluralSlug+"/titles", functions.getTitles(slugs));

  app.get("/"+slugs.pluralSlug+"/scores", functions.getScores(slugs));

  app.get("/"+slugs.pluralSlug+"/by-title/:substring",
    functions.getSomeBySubstring(slugs,"title")
  );
  // app.get("/"+slugs.pluralSlug+"/by-title/:sequence",
  //   functions.getSomeBySequence(slugs,"title")
  // );

  app.get("/"+slugs.pluralSlug+"/by-tag/:slug",
    functions.getSomeByDetailSlug(slugs,"tags")
  );

  app.get("/"+slugs.pluralSlug+"/sample/:count", function(req, res) {
    console.log("GET "+req.originalUrl);

    count = req.params.count;
    if (!count) { res.send({}); return; }

    content = meta.getCompiledCollection(slugs.storageSlug)();

    content.items.forEach(function(item) {
      item.selector = Math.log(1+item.score) * Math.random();
    });
    content.items = content.items
      .sort(function(a,b) { return b.selector - a.selector; })
      .slice(0,count);

    res.send(content);
  });

  var itemExpression = "^\\/"+slugs.singularSlug+"\\/([A-Za-z0-9-]+)$";

  app.get(
    new RegExp(itemExpression),
    functions.getOne(slugs,null,options.functions.transform)
  );

  //TODO PUT route - create item

  //TODO POST route - update item

  return slugs;

}
