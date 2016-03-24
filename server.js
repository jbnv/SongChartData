var app  = require("express")();
    cors = require('cors'),
    exec = require("child_process").exec,
    fs   = require('graceful-fs'),
    fsq = require("./lib/fs"),
    http = require('http'),
    meta = require("./app/meta"),
    path = require('path'),
    q = require("q"),
    scoring     = require('./app/scoring'),
    transform   = require('./app/transform');

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
  res.send(_compiledObject("search",req.params[0]));
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

app.get("/artists/incomplete", function(req, res) {
  console.log("/artists/incomplete");
  var result = _artists().filter(function(artist) { return !artist.complete; }).sort(transform.sortByTitle);
  res.send(result);
});

function _artist(slug,expand) { return _compiledObject("artist",slug); }

app.get(/^\/artist\/(.+)$/, function(req, res) {
  console.log("/artist",req.params[0]);
  var slug = req.params[0];
  res.send(_artist(slug,true));
});

app.get("/artist-types", function(req, res) {
  console.log("/artist-types");

  var artists = _artists();
  var map = require("./app/models/artist-types");

  artists.forEach(function(artist) {
    var type = artist.type || "";
    if (!map[type]) {
      console.log("Unrecognized type '"+type+"'");
      type = "u";
    }
    map[type].artists.push(artist);
  });

  var outbound = transform.objectToArray(map);
  outbound.forEach(function(type) { scoring.scoreCollection.call(type); });
  res.send(outbound);
});

app.get(/^\/artist-type\/(.+)$/, function(req, res) {
  console.log("/artist-type",req.params[0]);
  var slug = req.params[0];
  var map = require("./app/models/artist-types");
  var artists = _artists().filter(function(artist) { return artist.type && artist.type.slug === slug; });
  res.send({
    title: map[slug].title,
    artists: artists
  });
});

function _songs(options) { return _compiledCollection("song",options); }

app.get("/songs", function(req, res) {
  console.log("/songs");
  res.send(_songs());
});

function _isUnranked(song) {
  if (song.ranks === true) return true;
  return (song.ranks || []).length == 0;
}

app.get("/songs/unranked", function(req, res) {
  console.log("/songs/unranked");
  res.send(_songs().filter(_isUnranked).sort(transform.sortByTitle));
});

function _song(slug,expand) { return _compiledObject("song",slug); }

app.get(/^\/song\/(.+)$/, function(req, res) {
  console.log("/song",req.params[0]);
  var slug = req.params[0];
  res.send(_song(slug,true));
});

//

app.get("/summary", function(req,res) {
  console.log("/summary");

  var promises = meta.entityTypes
    .map(function(entityType) {
      var entityPath = path.join("raw",entityType);
      return fsq.readDir(entityPath).then(function(listing) { return {slug: entityType, count: listing.length}; });
    });

  q.all(promises)
    .then(function(entityCounts) {
      var outbound = {};
      entityCounts.forEach(function(entry) { outbound[entry.slug] = entry.count; });
      res.send(outbound);
    })
    .catch(function (error) {
      res.send({"error":error});
    })
  ;

});

// grep

function _filepathsToArray(err, stdin, stdout) {
  var filepaths = stdin.split('\n');
  var outbound = [];
  filepaths.forEach(function(filepath) {
    if (filepath == "") return;
    var entity = JSON.parse(fs.readFileSync(filepath));
    entity.typeSlug = filepath.split("/")[1];
    outbound.push(entity);
  });
  return outbound;
}

app.get(/^\/grep\/(.+)\/(.+)$/, function(req, res) {
  console.log("/grep",req.params[0],req.params[1]);

  var entityType = req.params[0];
  var pattern = req.params[1];
  var targetPath = path.join(meta.root,"raw",entityType,"*").replace(/\\/g,'/');
  var command = "grep -l "+pattern+" "+targetPath;

  exec(command, function(err, stdin, stdout){
    res.send(_filepathsToArray(err, stdin, stdout));
  });

});

app.get(/^\/grep\/(.+)$/, function(req, res) {
  console.log("/grep",req.params[0]);

  var pattern = req.params[0];
  var targetPath = path.join(meta.root,"raw","*").replace(/\\/g,'/');
  var command = "grep -rl "+pattern+" "+targetPath;

  exec(command, function(err, stdin, stdout){
    res.send(_filepathsToArray(err, stdin, stdout));
  });

});

//region Start the server.

var port = process.env.PORT || 9702;
app.listen(port, function() {
  console.log("Listening on port " + port + ".");
});
