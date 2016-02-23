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

app.get("/genres", function(req, res) {
  res.send(dir2obj("raw/genre"));
});

app.get(/^\/genre\/(.+)$/, function(req, res) {
  var slug = req.params[0];
  var filepath = path.join("raw/genre", slug+".json");
  var content = JSON.parse(fs.readFileSync(filepath));
  res.send(content);
});

app.get("/sources", function(req, res) {
  res.send(dir2obj("raw/source"));
});

app.get(/^\/source\/(.+)$/, function(req, res) {
  var slug = req.params[0];
  var filepath = path.join("raw/source", slug+".json");
  var content = JSON.parse(fs.readFileSync(filepath));
  res.send(content);
});

app.get("/artists", function(req, res) {
  res.send(dir2obj("raw/artist"));
});

app.get(/^\/artist\/(.+)$/, function(req, res) {
  var slug = req.params[0];
  var filepath = path.join("raw/artist", slug+".json");
  var content = JSON.parse(fs.readFileSync(filepath));
  res.send(content);
});

app.get("/songs", function(req, res) {
  res.send(dir2obj("raw/song"));
});

var port = process.env.PORT || 9702;
app.listen(port, function() {
  console.log("Listening on port " + port + ".");
});
