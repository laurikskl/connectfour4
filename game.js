const websocket = require("ws");
const config = require("./public/javascripts/config")

const rows = config.rows;
const cols = config.cols;
const in_a_row = config.in_a_row;


const game = function(gameID){
    this.player0 = null;    // websocket object
    this.player1 = null;    // websocket object
    this.id = gameID;       // gameid
    this.turn = null;       // 0 or 1 for which player's turn it is
    this.state = "WAITING"; // game state ("WAITING", "STARTED", "FINISHED", "ABORTED")
    this.table = new Array(rows*cols).fill(-100); // array for table fields, (-100: empty, 0: P0, 1: P1)
}

game.prototype.addPlayer = function(player){
    if(this.player0 == null){
        this.player0 = player;
    } else {
        this.player1 = player;
    }
}

game.prototype.has2Players = function(){
    console.log("p0: " + this.player0)
    console.log("p1: " + this.player1)
    return ( (this.player0 != null) && (this.player1 != null) );
}

game.prototype.startGame = function(){
    this.state = "STARTED";
    this.turn = Math.floor(Math.random() * 2);
    console.log("Game " + this.id + " started");
}

// checks if the move is valid and makes it if it is
game.prototype.placePiece = function(col, turn){
    for(let i = rows-1; i >= 0; i--){
        const id = config.getId(col, i);
        if(this.table[id] == -100){
            this.table[id] = turn;
            return true;
        }
    }
    return false;
}

// checks if the correct player made the move
game.prototype.correctPlayer = function(connection){
    if(connection == this.player0 && this.turn == 0){
        return true;
    } else if(connection == this.player1 && this.turn == 1){
        return true;
    } else {
        return false;
    }
}

// returns object {winner_id, win_start, win_dir};
game.prototype.winner = function(){
    // horizontal check
    for(let i = 0; i < cols - in_a_row + 1; i++){
        for(let j = 0; j < rows; j++){
            let sum = 0;
            for(let k = 0; k < in_a_row; k++){
                sum += this.table[config.getId(i + k, j)];
            }
            if(sum == 0 || sum == in_a_row){
                return {winner_id: sum/in_a_row, win_start: config.getId(i, j), win_dir: 0};
            }
        }
    }

    // down-right check
    for(let i = 0; i < cols - in_a_row + 1; i++){
        for(let j = 0; j < rows - in_a_row + 1; j++){
            let sum = 0;
            for(let k = 0; k < in_a_row; k++){
                sum += this.table[config.getId(i + k, j + k)];
            }
            if(sum == 0 || sum == in_a_row){
                return {winner_id: sum/in_a_row, win_start: config.getId(i, j), win_dir: 1};
            }
        }
    }

    // vertical check
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows - in_a_row + 1; j++){
            let sum = 0;
            for(let k = 0; k < in_a_row; k++){
                sum += this.table[config.getId(i, j + k)];
            }
            if(sum == 0 || sum == in_a_row){
                return {winner_id: sum/in_a_row, win_start: config.getId(i, j), win_dir: 2};
            }
        }
    }

    // down-left check
    for(let i = in_a_row - 1; i < cols; i++){
        for(let j = 0; j < rows - in_a_row + 1; j++){
            let sum = 0;
            for(let k = 0; k < in_a_row; k++){
                sum += this.table[config.getId(i - k, j + k)];
            }
            if(sum == 0 || sum == in_a_row){
                return {winner_id: sum/in_a_row, win_start: config.getId(i, j), win_dir: 3};
            }
        }
    }

    // draw check
    for(let i = 0; i < this.table.length; i++){
        if(this.table[i] == -100){
            // no winner
            return {winner_id: null, win_start: null, win_dir: null};
        }
    }

    // draw
    return {winner_id: -1, win_start: null, win_dir: null};
}

module.exports = game;