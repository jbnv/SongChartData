var app  = require("express")();
    fs   = require('fs'),
    http = require('http'),
    path = require('path');

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

app.get("/sources", function(req, res) {
  res.send(dir2obj("raw/source"));
});

app.get("/artists", function(req, res) {
  res.send(dir2obj("raw/artist"));
});

app.get("/songs", function(req, res) {
  res.send(dir2obj("raw/song"));
});

var port = process.env.PORT || 9702;
app.listen(port, function() {
  console.log("Listening on port " + port + ".");
});
