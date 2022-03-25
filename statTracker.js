/*
*   stat tracker
*   app displays these statistics on the splash screen
*/

const gameStatus = {
    gamesInitialized: 0,    /* number of games initialized */
    gamesAborted: 0,        /* number of games that have been aborted */
    gamesFinished: 0,       /* number of games that have finished */
    piecesPlaced: 0         /* number of pieces placed */
  };
  
  module.exports = gameStatus;