var meta = require("../app/meta"),
    writeEntity = require("../lib/fs").writeEntity;

module.exports = function(app) {

  app.post("/swap-song-scores", function(req,res) {
    console.log("POST /swap-song-scores",req.body);

    var a = req.body[0];
    var b = req.body[1];
    if (!a || !b) {
      res.send(false);
      return;
    }

    var entityA = meta.getRawObject("song",a)();
    var entityB = meta.getRawObject("song",b)();

    var temp = entityA.scores;
    entityA.scores = entityB.scores;
    entityB.scores = temp;

    writeEntity(meta.rawRoute("song",a),entityA);
    writeEntity(meta.rawRoute("song",b),entityB);
    res.send(true);
  });

}
