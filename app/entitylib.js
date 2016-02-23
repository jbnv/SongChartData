module.exports = function(that,argv) {

  function array_argument(pluralSlug,singularSlug) {
    that[pluralSlug] = [];
    if (argv[singularSlug]) {
      if (argv[singularSlug] instanceof Array) {
        that[pluralSlug] = argv[singularSlug];
      } else {
        that[pluralSlug].push(argv[singularSlug]);
      }
    }
  }

  function boolean_argument(slug,flag) {
    arg = argv[flag] || argv[slug];
    that[slug] = arg ? true : false; // force value
  }

  that.title = argv.t || "";

  that.instanceSlug = argv.s || that.title.toLowerCase();

  array_argument("tags","tag");
  array_argument("parents","parent");

  return {
    array_argument: array_argument,
    boolean_argument: boolean_argument
  }
}