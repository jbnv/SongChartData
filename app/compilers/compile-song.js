// entities: array of entities of the type
module.exports = function(yargs,entities) {
  titles = {};
  entities.forEach(function(entity) {
    titles[entity.instanceSlug] = entity.title;
    if (entity.genre && !entity.genres) { entity.genres = [entity.genre]; }
  });
  return {
    "all": entities,
    "titles": titles,
  }
}
