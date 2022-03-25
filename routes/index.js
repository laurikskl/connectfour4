var express = require('express');
var router = express.Router();

const gameStatus = require("../statTracker");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('splash.ejs', { 
    gamesPlayed: gameStatus.gamesFinished,
    gamesLive: (gameStatus.gamesInitialized - gameStatus.gamesAborted - 1),
    piecesPlaced: gameStatus.piecesPlaced
   });
});

router.get('/play', function(req, res) {
  res.sendFile('game.html', { root: "./public" });
});

module.exports = router;
