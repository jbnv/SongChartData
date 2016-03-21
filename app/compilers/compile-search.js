var chalk = require("chalk"),
    fs = require("fs"),
    path = require('path'),
    util = require("gulp-util"),

    meta = require('../meta'),
    writeEntity = require('../../lib/fs').writeEntity;

require('../polyfill');

String.prototype.transmute = function() {
  var outbound = this.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g,"");
  if (outbound.length < 5) return null;
  //TODO Read and apply the transforms.json file.
  return outbound;
}

// entities: array of entities of the type
module.exports = function(yargs) {

  // Array of slugs representing the recognized search terms.
  var terms = [];

  // slug: { "route", "title"}
  var entities = {};

  function process(typeSlug,inboundEntities) {

    util.log(chalk.blue(typeSlug),"Processing "+inboundEntities.length+" entities.");
    inboundEntities.forEach(function(entity) {

      // Entity does not have explicit search terms: Imply from title.
      var entityTerms = entity.searchTerms || (""+entity.title || "").toLowerCase().split(" ") || [];

      var ref = {
        "type" : typeSlug,
        "route" : typeSlug+"/"+entity.instanceSlug,
        "title" : entity.title,
        "score" : entity.score || 0,
        "songCount": (entity.songs || []).length,
        "artistCount": (entity.artists || []).length,
      };

      entityTerms.forEach(function(term) {

        term = term.transmute();
        if (!term) return;

        if (terms.includes(term)) {
          entities[term].push(ref);
        } else {
          terms.push(term);
          entities[term] = [ref];
        }

      });

    }); // entities
  }

  process("artist",meta.getArtists());
  //meta.getSongs().forEach(applyEntityFn);

  var termsRoute = meta.compiledRoute("search","terms");
  terms = terms.sort();
  writeEntity(termsRoute,terms);

  terms.forEach(function(term) {
    if (!entities[term]) return; // This shouldn't happen but is here to prevent errors.
    writeEntity(meta.compiledRoute("search",term),entities[term]);
    util.log(chalk.blue(term),chalk.gray(entities[term].length));
  })

  util.log("Compiled "+chalk.green(terms.length)+" entities.");
}
