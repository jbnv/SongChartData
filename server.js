var app  = require("express")(),
    cors = require('cors');

var entityRoute = require("./server/entity");

app.use(cors()); // Enable all CORS requests.

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
