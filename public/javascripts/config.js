(function (exports) {
    exports.cols = 7; // number of rows
    exports.rows = 6; // number of columns
    exports.in_a_row = 4; // required number to get in a row
    exports.IP = "ws://localhost:3000", // websocket ip address
    exports.getId = function(col, row){ // returns the id of a cell
        return row * this.cols + col;
    }
  })(typeof exports === "undefined" ? (this.Config = {}) : exports);