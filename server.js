// io = all clients. socket = the specific client emitted

var axios = require("axios");
var express = require("express");
var app = express();
var http = require("http");
var socketIo = require("socket.io");

var server = http.createServer(app);
var io = socketIo.listen(server);
app.use(express.static(__dirname + "/public"));
server.listen(9999, () => {
  console.log("Server running on localhost:9999");
});

// declare an array line_histry to keep strack of all lines ever drawn
var line_history = [];

// stores list of nouns
var wordList = [];

// current random word
var currentRandomWord = "";

// handler for new incoming connection
// Whenever a new client connects, this
// function is called and the socket of the new client is passed as an argument
io.on("connection", socket => {
  console.log(currentRandomWord);
  function uploadImage(randomWord) {
    axios
      .get(
        `https://pixabay.com/api/?key=3371927-979f697ee2f27636622bd4e54&safesearch=true&per_page=3&q=${
          randomWord
        }`
      )
      .then(info => {
        socket.emit("displayImage", info.data.hits[0].webformatURL);
      })
      .catch(err => {
        console.log(err);
        return new Error(err);
      });
  }

  socket.on("displayImage", randomWord => {
    uploadImage(randomWord);
  });

  socket.on("clear", () => {
    line_history = [];
    io.emit("clearRect");
  });

  if (currentRandomWord != "") {
    socket.emit("getRand", currentRandomWord);
  }
  // send all the lines to a new client (just joined)
  for (var i in line_history) {
    socket.emit("draw_line", { newLine: line_history[i] });
  }

  //add a handler for our own message-type draw_line to the new client
  //each time we recieve a line, we ad it to line_history and send it to
  // all connected clients so they can update their canvases
  // THE SOLE REASON OF THIS IS TO PUSH TO ARRAY. THATS LITERALLY IT
  socket.on("draw_line", data => {
    // add received line to history
    line_history.push(data.line);
    // send line to all clients
    io.emit("draw_line", { newLine: data.line });
  });

  socket.on("getList", () => {
    let lineReader = require("readline").createInterface({
      input: require("fs").createReadStream("./public/nounlist.txt")
    });
    // store every word in wordlist
    lineReader.on("line", function(line) {
      wordList.push(line);
    });
  });

  // random word extraction
  socket.on("getRand", () => {
    currentRandomWord = wordList[Math.floor(Math.random() * wordList.length)];
    io.emit("getRand", currentRandomWord);
  });
});
