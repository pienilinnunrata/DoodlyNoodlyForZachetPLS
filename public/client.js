// Wait for HTML page to load and ask the browser to tell when it's ready

document.addEventListener("DOMContentLoaded", () => {
  var mouse = {
    click: false,
    move: false,
    pos: {
      x: 1100,
      y: 1100
    },
    pos_prev: false
  };
  
  // get canvas element
  var canvas = document.getElementById("drawing");

  // create a 2D drawing context to draw
  var context = canvas.getContext("2d");

  // tell socket to connect to server
  var socket = io.connect();

  // window dimensions
  var width = window.innerWidth;
  var height = window.innerHeight;

  // sets the canvas width and height properties to its container's size
  canvas.width = document.getElementById("container-canvas").offsetWidth;
  canvas.height = document.getElementById("container-canvas").offsetHeight;

  // mouse.click is true whenever we keep mouse button clicked
  canvas.onmousedown = e => {
    mouse.click = true;
  };
  canvas.onmouseup = e => {
    mouse.click = false;
  };

  // mouse.pos.x and mouse.pos.y is updated whenever mouse is moved
  canvas.onmousemove = e => {
    mouse.pos.x = e.clientX / width;
    mouse.pos.y = e.clientY / height;
    // set mouse.move to true, so we can check if the mouse moved or not
    mouse.move = true;
  };

  // get random color for this player's marker
  let x = Math.floor(Math.random() * 256);
  let y = Math.floor(Math.random() * 256);
  let z = Math.floor(Math.random() * 256);
  var myColor = "rgb(" + x + "," + y + "," + z + ")";
  // get canvas position offset for this player
  var offset = {
    left: canvas.offsetLeft,
    top: canvas.offsetTop
  };

  socket.on("draw_line", data => {
    var line = data.newLine;
    context.strokeStyle = line[2];

    // start a new path
    context.beginPath();
    context.lineWidth = 2;

    // move to the first point
    context.moveTo(
      line[0].x * width - offset.left,
      line[0].y * height - offset.top
    );

    // draw the line to the second received point
    context.lineTo(
      line[1].x * width - offset.left,
      line[1].y * height - offset.top
    );

    // actually draw the line
    context.stroke();
  });

  // Runs every 25/1000th of a second
  // checks if player is drawing, if so, then draw the line
  function mainLoop() {
    if (mouse.click && mouse.move && mouse.pos_prev) {
      socket.emit("draw_line", {
        // render this player's color for that player on other clients as well
        // render this player's drawings based on the client's canvas offset, not its own offset
        line: [mouse.pos, mouse.pos_prev, myColor, offset]
      });
      mouse.move = false;
    }
    mouse.pos_prev = {
      x: mouse.pos.x,
      y: mouse.pos.y
    };
    setTimeout(mainLoop, 25);
  }
  mainLoop();

  // clear function
  var clearButton = document.getElementById("clear");
  clearButton.addEventListener("click", e => {
    socket.emit("clear");
    //document.getElementById("preWord").innerHTML = "Fail! Waiting for someone to generate a word";
  });
  var okButton = document.getElementById("ok");
  okButton.addEventListener("click", e => {
    socket.emit("clear");
    //document.getElementById("preWord").innerHTML = "Success! Waiting for someone to generate a word";
  })
  socket.on("clearRect", () => {
    context.clearRect(0, 0, width, height);
    document.getElementById("currentImage").src = "https://image.flaticon.com/icons/png/128/39/39293.png";
    document.getElementById("generate").disabled = false;
    document.getElementById("generate").style.opacity = "1";
    document.getElementById("preWord").innerHTML = "The game has ended! Waiting for someone to generate a word";
    document.getElementById("currentWord").innerHTML = "";
    document.getElementById("hint").disabled = true;
    document.getElementById("ok").style.opacity = "0";
  });

});
