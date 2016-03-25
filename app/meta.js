var fs = require('fs'),
    path = require('path');

// return folders within a path
function folders(dir) {
  return fs.readdirSync(dir)
      .filter(function(file){
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
};

var root = path.normalize(".");
var rawRoot = path.join(root,"raw");
var compiledRoot = path.join(root,"compiled");

function _rawRoute(typeSlug,instanceSlug) { return path.join(root,"raw",typeSlug,""+instanceSlug); }
function _compiledRoute(typeSlug,instanceSlug) { return path.join(root,"compiled",typeSlug,""+instanceSlug); }
function _chartRoute(typeSlug,instanceSlug) { return path.join(root,"compiled",typeSlug,"charts",""+instanceSlug); }

function _getObject(groupSlug,typeSlug,instanceSlug) {
  return function() {

    if (!typeSlug) return null;
    if (!instanceSlug) return null;

    var filepath = path.join(root,groupSlug,typeSlug,""+instanceSlug+".json");
    var text = fs.readFileSync(filepath);
    if (!text || text === "") return null;
    return JSON.parse(text);

  };
}

function _getRawObject(typeSlug,instanceSlug) {
  return _getObject("raw",typeSlug,instanceSlug);
}

function _getCompiledObject(typeSlug,instanceSlug) {
  return _getObject("compiled",typeSlug,instanceSlug);
}

function _getCompiledCollection(typeSlug) {
  return _getObject("compiled",typeSlug,"all");
}

function _getTitles(typeSlug) {
  return _getObject("compiled",typeSlug,"titles");
}

////////////////////////////////////////////////////////////

module.exports = {

  entityTypes: [
    "artist","artist-list","genre","geo",
    "playlist","song","source","tag"
  ],

  root: root,
  rawRoot: rawRoot,
  compiledRoot: compiledRoot,
  rawRoute: _rawRoute,
  compiledRoute: _compiledRoute,
  chartRoute: _chartRoute,
  getRawObject: _getRawObject,
  getCompiledObject: _getCompiledObject,
  getCompiledCollection: _getCompiledCollection,

  getArtists: _getCompiledObject("artist","all"),
  getArtistLists: _getCompiledObject("artist-list","all"),
  getGenres: _getCompiledObject("genre","all"),
  getLocations: _getCompiledObject("geo","all"),
  getPlaylists: _getCompiledObject("playlist","all"),
  getSources: _getCompiledObject("source","all"),
  getSongs: _getCompiledObject("song","all"),
  getTags: _getCompiledObject("tag","all"),

  months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
}
