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

var line_history = [];
var wordList = [];
var currentRandomWord = "";

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

  socket.on("clear", success => {
    line_history = [];
    io.emit("clearRect", success);
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
  socket.on("draw_line", data => {
    line_history.push(data.line);
    // send line to all clients
    io.emit("draw_line", { newLine: data.line });
  });

  socket.on("getList", () => {
    let lineReader = require("readline").createInterface({
      input: require("fs").createReadStream("./public/nounlist.txt")
    });
    lineReader.on("line", function(line) {
      wordList.push(line);
    });
  });

  socket.on("getRand", () => {
    currentRandomWord = wordList[Math.floor(Math.random() * wordList.length)];
    io.emit("getRand", currentRandomWord);
  });
});
