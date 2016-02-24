// entities: array of entities of the type
module.exports = function(yargs,entities) {
  titles = {};
  entities.forEach(function(entity) {
    titles[entity.instanceSlug] = entity.title;
  });
  return {
    "all": entities,
    "titles": titles,
  }
}
