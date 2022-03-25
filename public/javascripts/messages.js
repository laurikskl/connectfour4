(function (exports) {

    /*
    *   Game start message
    *   Sent when an opponent is found and the game can start
    *   Server to Player
    * 
    *   player_id: 0 or 1
    *   turn: 0 or 1 for who starts
    *   opp_name: opponent's name
    **/
    exports.GAME_START = {
        type: "GAME_START",
        player_id: null,
        turn: null,
        //opp_name: null,
    };

    /*
    *   Game move message
    *   Sent when a move is made
    *   Player to Server or Server to Player
    * 
    *   column: (0 to 6 for which column the move goes to)
    **/
    exports.GAME_MOVE = {
        type: "GAME_MOVE",
        column: null,
        player: null,
    };

    /*
    *   Game abort message
    *   Sent when a player disconnects
    *   Server to player
    **/
    exports.GAME_ABORT = {
        type: "GAME_ABORT",
    };
    exports.S_GAME_ABORT = JSON.stringify(exports.GAME_ABORT);

    /*
    *   Game end message
    *   Sent when a player wins
    *   Server to player
    * 
    *   winner_id: 0 or 1 for who won (-1 for draw)
    *   win_start: id of the start of the winning line
    *   win_dir: 0: horizontal, 1: down-right, 2: vertical, 3: down-left 
    **/
    exports.GAME_END = {
        type: "GAME_END",
        winner_id: null,
        win_start: null,
        win_dir: null,
    };

    // json string only exists for game abort because others need data to be filled
    // message for rematch request?


})(typeof exports === "undefined" ? (this.Messages = {}) : exports);
  //if exports is undefined, we are on the client; else the server