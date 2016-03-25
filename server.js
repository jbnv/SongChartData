var app  = require("express")(),
    cors = require('cors');

var entityRoute = require("./server/entity");

app.use(cors()); // Enable all CORS requests.

//region Routes.

require("./server/artist")(app);
entityRoute("genre",app);
entityRoute({singular:"location",storage:"geo"},app);
entityRoute("playlist",app);
require("./server/song")(app);
entityRoute("source",app);
entityRoute("tag",app);

require("./server/grep")(app);
entityRoute("search",app);
require("./server/summary")(app);

//region Start the server.

var port = process.env.PORT || 9702;
app.listen(port, function() {
  console.log("Listening on port " + port + ".");
});
