var fs = require('fs'),
    path = require('path');

// return folders within a path
function folders(dir) {
  return fs.readdirSync(dir)
      .filter(function(file){
        return fs.statSync(path.join(dir, ""+file)).isDirectory();
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

    var filepath = path.join(root,""+groupSlug,""+typeSlug,""+instanceSlug+".json");
    var text = fs.readFileSync(filepath);
    if (!text || text === "") return null;

    var outbound = {};
    try {
      outbound = JSON.parse(text);
    } catch(ex) {
      outbound.exception = ex;
      outbound.groupSlug = groupSlug;
      outbound.typeSlug = typeSlug;
      outbound.instanceSlug = instanceSlug;
    }

    return outbound;

  };
}

function _getRawObject(typeSlug,instanceSlug) {
  return _getObject("raw",typeSlug,instanceSlug);
}

function _getCompiledObject(typeSlug,instanceSlug) {
  return _getObject("compiled",typeSlug,instanceSlug);
}

// options: {
//  filterFn
//  sortFn
//  count
//  page
// }
function _getCompiledCollection(typeSlug,options) {
  if (!typeSlug) throw "_getCompiledCollection: typeSlug is required!";

  return function() {
    var allItems = _getObject("compiled",typeSlug,"all")() || []; // should be an array

    if (!options) options = {};

    if (options.sortFn) {
      allItems = allItems.sort(options.sortFn);
    }

    var outbound = {
      "totalCount":allItems.length
    };

    var filteredItems = [];
    if (options.filterFn) {
      filteredItems = allItems.filter(options.filterFn);
      outbound.filteredCount = filteredItems.length;
    } else {
      filteredItems = allItems;
    }

    if (options.count) {
      var count = parseInt(options.count);
      var page =  parseInt(options.page || 1);
      outbound.filteredCount = count;
      outbound.pageSize = count;
      outbound.pageCount = Math.ceil(filteredItems.length/count);
      outbound.currentPage = page;
      outbound.items = filteredItems.slice(count*(page-1),count*page);
    } else {
      outbound.items = filteredItems;
    }

    return outbound;

  };
}

function _getTitles(typeSlug) {
  return _getObject("compiled",typeSlug,"titles");
}

////////////////////////////////////////////////////////////

module.exports = {

  entityTypes: [
    "artist","genre","geo",
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
