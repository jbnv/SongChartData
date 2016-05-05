var app  = require("express")(),
    bodyParser = require('body-parser'),
    cors = require('cors');

    entityRoute = require("./server/entity");

app.use(cors()); // Enable all CORS requests.
app.use(bodyParser.json()); // Parse application/json.

//region Routes.

require("./server/artist")(app);
require("./server/era")(app);
entityRoute("genre",app);
entityRoute({singular:"location",storage:"geo"},app);
entityRoute("playlist",app);
require("./server/song")(app);
entityRoute("source",app);
entityRoute("tag",app);

require("./server/grep")(app);
require("./server/search")(app);
require("./server/summary")(app);

require("./server/swap-song-scores")(app);

// Catch-all.
app.use(function(req,res) {
  console.log("GET",req.originalUrl,"(bad route)");
  res.status(404).send("Bad route '"+req.originalUrl+"'.");
});


//region Start the server.

var port = process.env.PORT || 9702;
app.listen(port, function() {
  console.log("Listening on port " + port + ".");
});
