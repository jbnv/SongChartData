var app  = require("express")();
    cors = require('cors'),
    fs   = require('fs'),
    http = require('http'),
    path = require('path');

require("./app/polyfill");

app.use(cors()); // Enable all CORS requests.

function dir2obj(dir) {
  content = {};
  fs.readdirSync(dir)
    .filter(function(file){
      return !fs.statSync(path.join(dir, file)).isDirectory();
    })
    .forEach(function(file){
      slug = file.replace(".json","");
      content[slug] = JSON.parse(fs.readFileSync(path.join(dir, file)));
    });
  return content;
}

function _rawObject(type,specifier) {
  if (!type) return null;
  if (!specifier) return null;
  var filepath = path.join("raw",type,specifier+".json");
  return JSON.parse(fs.readFileSync(filepath));
}

function _compiledObject(type,specifier) {
  if (!type) return null;
  if (!specifier) return null;
  var filepath = path.join("compiled",type,specifier+".json");
  return JSON.parse(fs.readFileSync(filepath));
}


function _compiledCollection(type,options) {
  if (!options) options = {};
  var content = _compiledObject(type,"all");
  if (options.filter) {
    content = content.filter(options.filter);
  }
  return content;
}

//region Routes.

app.get(/^\/search\/(.+)$/, function(req, res) {
  console.log("/search",req.params[0]);
  // var slug = req.params[0];
  // var filepath = path.join("xxx", slug+".json");
  // var content = JSON.parse(fs.readFileSync(filepath));
  // res.send(content);
});

function _genres(options) { return _compiledCollection("genre",options); }

app.get("/genres", function(req, res) {
  console.log("/genres");
  res.send(_genres());
});

function _genre(slug,expand) { return _compiledObject("genre",slug); }

app.get(/^\/genre\/(.+)$/, function(req, res) {
  console.log("/genre",req.params[0]);
  var slug = req.params[0];
  res.send(_genre(slug,true));
});

function _locations(options) { return _compiledCollection("geo",options); }

app.get("/locations", function(req, res) {
  console.log("/locations");
  res.send(_locations());
});

function _location(slug,expand) { return _compiledObject("geo",slug); }

app.get(/^\/location\/(.+)$/, function(req, res) {
  console.log("/location",req.params[0]);
  var slug = req.params[0];
  res.send(_location(slug));
});

function _playlists(options) { return _compiledCollection("playlist",options); }

app.get("/playlists", function(req, res) {
  console.log("/playlists");
  res.send(_playlists());
});

function _playlist(slug,expand) { return _compiledObject("playlist",slug); }

app.get(/^\/playlist\/(.+)$/, function(req, res) {
  console.log("/playlist",req.params[0]);
  var slug = req.params[0];
  res.send(_playlist(slug,true));
});

function _sources(options) { return _compiledCollection("source",options); }

app.get("/sources", function(req, res) {
  console.log("/sources");
  res.send(_sources());
});

function _source(slug,expand) { return _compiledObject("source",slug); }

app.get(/^\/source\/(.+)$/, function(req, res) {
  console.log("/source",req.params[0]);
  var slug = req.params[0];
  res.send(_source(slug,true));
});

function _artists(options) { return _compiledCollection("artist",options); }

app.get("/artists", function(req, res) {
  console.log("/artists");
  res.send(_artists());
});

function _artist(slug,expand) { return _compiledObject("artist",slug); }

app.get(/^\/artist\/(.+)$/, function(req, res) {
  console.log("/artist",req.params[0]);
  var slug = req.params[0];
  res.send(_artist(slug,true));
});

function _songs(options) { return _compiledCollection("song",options); }

app.get("/songs", function(req, res) {
  console.log("/songs");
  res.send(_songs());
});

function _song(slug,expand) { return _compiledObject("song",slug); }

app.get(/^\/song\/(.+)$/, function(req, res) {
  console.log("/song",req.params[0]);
  var slug = req.params[0];
  res.send(_song(slug,true));
});

//region Start the server.

var port = process.env.PORT || 9702;
app.listen(port, function() {
  console.log("Listening on port " + port + ".");
});
