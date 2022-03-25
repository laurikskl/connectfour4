const express = require("express");
const http = require("http");
const websocket = require("ws");

const gameStatus = require("./statTracker");
const Game = require("./game");

const indexRouter = require("./routes/index");
const messages = require("./public/javascripts/messages")

const port = process.argv[2];
const app = express();

app.set("view engine", "ejs")
app.use(express.static("./public"));

app.get("/play", indexRouter);
app.get("/", indexRouter);

const server = http.createServer(app);
const wss = new websocket.Server({ server });

const websockets = {};

/*
* Checks every 50 seconds if a game has been aborted
* Deletes it if there is
*/
setInterval(function() {
  for (let i in websockets) {
    if (Object.prototype.hasOwnProperty.call(websockets,i)) {
      let gameObj = websockets[i];

      if (gameObj.state == "ABORTED") {
        console.log("deleted game " + gameObj.id);
        delete websockets[i];
      }
    }
  }
}, 50000);

let connectionID = 0;
let currentGame = new Game(gameStatus.gamesInitialized++)


// runs when a connection is made with a user
wss.on("connection", function(ws) {

  // adds the player connection to an available game object
  const con = ws;

  con.id = connectionID++;
  currentGame.addPlayer(con);
  con.game = currentGame;
  websockets[con.id] = currentGame;

  console.log("Added connection " + con.id + " to game " + currentGame.id);

  // checks if the available game has 2 players
  if(currentGame.has2Players()){

    // starts the game if yes
    currentGame.startGame();

    // sends the info to players
    let startMsg = messages.GAME_START;
    startMsg.turn = currentGame.turn;
    startMsg.player_id = 0;

    currentGame.player0.send(JSON.stringify(startMsg));

    startMsg.player_id = 1;

    currentGame.player1.send(JSON.stringify(startMsg));

    // makes a new game object
    currentGame = new Game(gameStatus.gamesInitialized++);
  }

  // runs when a client sends a message
  con.on("message", function incoming(message) {

    console.log("[LOG] from connection " + con.id + " in game " + con.game.id + ": " + message);

    const msgObj = JSON.parse(message.toString());
    const gameObj = con.game;

    // when a player sends a game move
    if(msgObj.type == "GAME_MOVE"){

      // check if the game has started, the correct player sent the message, message has the correct player_id, if the piece can be placed
      if(gameObj.state == "STARTED" &&
          gameObj.correctPlayer(con) &&
          msgObj.player == gameObj.turn &&
          gameObj.placePiece(msgObj.column, gameObj.turn)){

        // changes the turn from one player to another (alternates between 0 and 1)
        gameObj.turn = Math.abs(gameObj.turn - 1);
        gameStatus.piecesPlaced++;

        // sends the move back to the players
        let move = messages.GAME_MOVE;
        move.column = msgObj.column;
        move.player = msgObj.player;

        gameObj.player0.send(JSON.stringify(move));
        gameObj.player1.send(JSON.stringify(move));

        // checks if somebody won
        const winner = gameObj.winner();
        if(winner.winner_id != null){

          // sets game state
          gameObj.state = "FINISHED";
          gameStatus.gamesFinished++;

          // sends the end of game message
          let winMsg = messages.GAME_END;
          winMsg.winner_id = winner.winner_id;
          winMsg.win_start = winner.win_start;
          winMsg.win_dir = winner.win_dir;

          gameObj.player0.send(JSON.stringify(winMsg));
          gameObj.player1.send(JSON.stringify(winMsg));
        }
      }
    }
  });

  // runs when the connection is closed
  con.on("close", function(code){

    // checks if the player closed the connection
    if(code == 1001){

      const gameObj = con.game;
      console.log("[LOG] " + con.id + " from game " + gameObj.id + " lost connection");
      let stayer;

      // removes the connection from the game object
      if(gameObj.player0 == con){
        gameObj.player0 = null;
        stayer = gameObj.player1;
      } else if(gameObj.player1){
        gameObj.player1 = null;
        stayer = gameObj.player0;
      }

      // if the game had already started set state to aborted
      if(gameObj.state == "STARTED" || gameObj.state == "FINISHED"){
          gameObj.state = "ABORTED";


        gameStatus.gamesAborted++;
        // alert the other player about abortion
        stayer.send(messages.S_GAME_ABORT);
      }

      // close the connection on the server side
      con.close();
    }
  });

});

server.listen(port);

/* Auto-generated code, not necessary but there might be some useful stuff here

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
*/
