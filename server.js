var app  = require("express")();
    cors = require('cors'),
    fs   = require('fs'),
    http = require('http'),
    path = require('path');

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
  var filepath = path.join("raw",type,specifier+".json");
  return JSON.parse(fs.readFileSync(filepath));
}

function _compiledObject(type,specifier) {
  var filepath = path.join("compiled",type,specifier+".json");
  return JSON.parse(fs.readFileSync(filepath));
}

app.get(/^\/search\/(.+)$/, function(req, res) {
  console.log("/search",req.params[0]);
  // var slug = req.params[0];
  // var filepath = path.join("xxx", slug+".json");
  // var content = JSON.parse(fs.readFileSync(filepath));
  // res.send(content);
});

app.get("/genres", function(req, res) {
  console.log("/genres");
  res.send(dir2obj("raw/genre"));
});

app.get(/^\/genre\/(.+)$/, function(req, res) {
  console.log("/genre",req.params[0]);
  var slug = req.params[0];
  var filepath = path.join("raw/genre", slug+".json");
  var content = JSON.parse(fs.readFileSync(filepath));
  res.send(content);
});

app.get("/sources", function(req, res) {
  console.log("/sources");
  res.send(dir2obj("raw/source"));
});

app.get(/^\/source\/(.+)$/, function(req, res) {
  console.log("/source",req.params[0]);
  var slug = req.params[0];
  var filepath = path.join("raw/source", slug+".json");
  var content = JSON.parse(fs.readFileSync(filepath));
  res.send(content);
});

app.get("/artists", function(req, res) {
  console.log("/artists");
  res.send(dir2obj("raw/artist"));
});

app.get(/^\/artist\/(.+)$/, function(req, res) {
  console.log("/artist",req.params[0]);
  var slug = req.params[0];
  var filepath = path.join("raw/artist", slug+".json");
  var content = JSON.parse(fs.readFileSync(filepath));
  res.send(content);
});

app.get("/songs", function(req, res) {
  console.log("/songs");
  res.send(dir2obj("raw/song"));
});

app.get(/^\/song\/(.+)$/, function(req, res) {
  console.log("/song",req.params[0]);
  var slug = req.params[0];
  var filepath = path.join("raw/song", slug+".json");
  var content = JSON.parse(fs.readFileSync(filepath));
  res.send(content);
});

var port = process.env.PORT || 9702;
app.listen(port, function() {
  console.log("Listening on port " + port + ".");
});
