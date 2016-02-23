function Song(yargs) {
  if (!yargs) return; // no yargs means just instantiate the function.

  argv = yargs.demand(["t"]).argv;

  var e = require("../entitylib")(this,argv);
  this.genre = argv.g;
  this.debut = argv.d;
  this.source = argv.source;
  if (argv.r) {
    this.ranks = JSON.parse(argv.r);
  } else {
    this.ranks = [];
  }

  function addArtist(a) {
    a1 = a.split(":");
    artistSlug = a1[0];
    roleSlug =  a1[1] || true;
    if (roleSlug == 'co') roleSlug = true;
    artistObj[artistSlug] = roleSlug;
  }

  artistArgs = argv.a;
  artistObj = {};
  if (artistArgs) {
    if (artistArgs instanceof Array) {
      artistArgs.forEach(addArtist);
    } else {
      addArtist(artistArgs);
    }
  }
  this["artists"] = artistObj;

  // Legacy.
  if (argv.tags) this.tags = argv.tags.split(" ");
}

Song.prototype.typeSlug = "song";
Song.prototype.typeNoun = "song";

Song.prototype.parameters = {
  "a":"Artist, with optional role.",
  "d":"Debut date.",
  "g":"Genre.",
  "r":"Ranks (as array of values).",
  "s":"Slug. (Req)",
  "t":"Name of the breed. (Req)"
}

module.exports = Song;
