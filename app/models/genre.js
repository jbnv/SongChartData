var e = require("../entitylib");

function Genre(yargs) {
  if (!yargs) return; // no yargs means just instantiate the function.

  argv = yargs.demand(["s","t"]).argv;

  this.instanceSlug = argv.s || "";

  this.title = argv.t || "";

  this.parents = [];
  if (argv.parent) {
    if (argv.parent instanceof Array) {
      this.parents = argv.parent;
    } else {
      this.parents.push(argv.parent);
    }
  }
}

Genre.prototype.typeSlug = "genre";
Genre.prototype.typeNoun = "genre";

Genre.prototype.parameters = {
  "s":"Slug. (Req)",
  "t":"Name of the breed. (Req)"
}

// entities: array of entities of the type
Genre.prototype.compile = function(yargs,entities) {
  titles = {};
  entities.forEach(function(entity) {
    titles[entity.instanceSlug] = entity.title;
  });
  return {
    "all": entities,
    "titles": titles,
  }
}

module.exports = Genre;
