const rows = Config.rows;
const cols = Config.cols;
const in_a_row = Config.in_a_row;

let time_spent = 0; //in seconds
let pieces_placed = 0;

let player_id = null;
let turn = null;

const socket = new WebSocket(Config.IP);

let cells = [cols*rows]
let columns = [cols]
createTable()

setInterval(function(){
    if(turn != null){
        let time_display = document.querySelector("#time_spent");
        let mins = Math.floor(time_spent / 60);
        let seconds = time_spent % 60;
        let time_string = mins + ":";
        if(seconds < 10){
            time_string += "0";
        }
        time_string += seconds;
        time_display.innerHTML = time_string;
        time_spent++;
    }
}, 1000);

function cell(tag, id){
    this.id = id
    this.tag = tag
}

function column(tag, id){
    this.id = id
    this.tag = tag
    tag.onclick = function(){
        sendMove(this.id)
    }
}

// runs when client receives a message from the server
socket.onmessage = function( event ){
    console.log(event.data);
    const msg = JSON.parse(event.data);

    if(msg.type == "GAME_MOVE"){
        // update piece counter
        pieces_placed++;
        let piece_display = document.querySelector("#pieces_placed");
        piece_display.innerHTML = pieces_placed;

        drawPiece(msg.column, msg.player);
        drawTurn();

    } else if(msg.type == "GAME_START"){
        startFunction(msg)

    } else if(msg.type == "GAME_ABORT"){
        abortFunction();        

    } else if(msg.type == "GAME_END"){
        endFunction(msg);
        
    } 
};

socket.onopen = function(){
    console.log("Websocket connection opened");
};

// sends a move to the server
function sendMove(id){
    let col = id % cols;
    if( (cells[col].tag.getAttribute("class") == "cell") &&
            (turn == player_id) &&
            (turn != null) ){
        let move = Messages.GAME_MOVE;
        move.column = col;
       
        move.player = player_id;
        socket.send(JSON.stringify(move));
    }
}

// draws the played piece on the grid
function drawPiece(col, player){
    for(let i = rows-1; i >= 0; i--){
        const id = Config.getId(col, i);
        if(cells[id].tag.getAttribute("id") == null){
            if(player == 0){
                cells[id].tag.setAttribute("id", "Red");
            } else if(player == 1){
                cells[id].tag.setAttribute("id", "Blue");
            }
            turn = Math.abs(turn - 1);
            break;
        }
    }
}

// draws the visual to show whose turn it is
function drawTurn(){
    let player1 = document.querySelector("#p1_turn");
    let player2 = document.querySelector("#p2_turn");
    if(turn == 0){
        player1.setAttribute("class", 'cell');
        player2.setAttribute("class", "invis");
    } else if(turn == 1){
        player1.setAttribute("class", "invis");
        player2.setAttribute("class", 'cell');
    } else {
        player1.setAttribute("class", "invis");
        player2.setAttribute("class", "invis");
    }
}

// runs when the client receives a start message
function startFunction(msg){
    player_id = msg.player_id;
    turn = msg.turn
    let str = ""
    if(player_id == 0){
        str = "columnRed";
    } else if(player_id == 1){
        str = "columnBlue"
    }
    //let columns = document.querySelectorAll(".column")
    for(let i = 0; i < columns.length; i++){
        columns[i].tag.setAttribute("class", str)
    }

    let popup = document.querySelector(".message");
    popup.setAttribute("id", "hide");

    drawTurn();
}

// runs when the client receives an abort message
function abortFunction(){
    let popup = document.querySelector(".message")
    popup.setAttribute("id", "aborted");

    turn = null;
    drawTurn();
}

// runs when the client receives the game end message
function endFunction(msg){
    let popup = document.querySelector(".message")

    if(msg.winner_id == player_id){
        popup.setAttribute("id", "win");
    } else if(msg.winner_id == -1){
        popup.setAttribute("id", "draw");
    } else {
        popup.setAttribute("id", "loss");
    }

    turn = null;
    drawTurn();

    drawWin(msg);
}

// shows the win on the grid
function drawWin(msg){

    let win_id = null;
    if(msg.winner_id == 0){
        win_id = "RedWin"
    } else {
        win_id = "BlueWin"
    }

    // horizontal win
    if(msg.win_dir == 0){
        for(let i = 0; i < in_a_row; i++){
            cells[msg.win_start + i].tag.setAttribute("id", win_id);
        }
    }
    
    // down-right win
    if(msg.win_dir == 1){
        for(let i = 0; i < in_a_row; i++){
            cells[msg.win_start + i + i*cols].tag.setAttribute("id", win_id);
        }
    }
    
    // vertical win
    if(msg.win_dir == 2){
        for(let i = 0; i < in_a_row; i++){
            cells[msg.win_start + i*cols].tag.setAttribute("id", win_id);
        }
    }
    
    // down-left win
    if(msg.win_dir == 3){
        for(let i = 0; i < in_a_row; i++){
            cells[msg.win_start - i + i*cols].tag.setAttribute("id", win_id);
        }
    }
}

/*  
*   creates the html table for the game
*/
function createTable(){
    

    let body = document.querySelector("body")
    let table = document.createElement("div")
    table.setAttribute('class', 'wrapper')
    body.append(table)
    for(let i = 0; i < cols; i++){
        let tr = document.createElement("div")
        tr.setAttribute("class", "column")
        tr.setAttribute("id", i)
        table.append(tr)
        columns[i] = new column(tr, i)
        for(let j = 0; j < rows; j++){
            let th = document.createElement("div")
            let id = (j*cols)+i
            th.setAttribute("class", "cell")
            //th.setAttribute("id", id)
            tr.append(th)
            cells[id] = new cell(th, id)
        }
    }
}