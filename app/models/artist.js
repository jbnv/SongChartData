function Artist(yargs) {
  if (!yargs) return; // no yargs means just instantiate the function.

  argv = yargs.demand(["t"]).argv;

  var e = require("../entitylib")(this,argv);
  e.array_argument("genres","g");
  e.array_argument("members","m");
  e.array_argument("xref","x");
  e.boolean_argument("complete","c");
  this.origin = argv.o || "";
  this.birth = argv.birth || "";
  this.death = argv.death || "";

  // Type flags
  if (argv["solo-male"]) {
    this.type = 'm';
  } else if (argv["solo-female"]) {
    this.type = 'f';
  } else if (argv["group"]) {
    this.type = 'g';
  } else if (argv["duo"]) {
    this.type = 'd';
  }

  // Legacy.
  if (argv.tags) this.tags = argv.tags.split(" ");
}

Artist.prototype.typeSlug = "artist";
Artist.prototype.typeNoun = "artist";

Artist.prototype.parameters = {
  "c":"Artist is complete.",
  "g":"Genre.",
  "m":"A member of the act.",
  "o":"Origin.",
  "s":"Slug. (Req)",
  "t":"Name of the artist. (Req)",
  "tags":"Tags. (Opt.)"
}

// entities: array of entities of the type
Artist.prototype.compile = function(yargs,entities) {
  titles = {};
  entities.forEach(function(entity) {
    titles[entity.instanceSlug] = entity.title;
  });
  return {
    "all": entities,
    "titles": titles,
  }
}

module.exports = Artist;
