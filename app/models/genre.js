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

module.exports = Genre;
