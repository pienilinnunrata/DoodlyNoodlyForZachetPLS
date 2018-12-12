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
  

  var canvas = document.getElementById("drawing");
  var currentImage = document.getElementById("currentImage");
  var generateButton = document.getElementById("generate");
  var preWord = document.getElementById("preWord");
  var currentWord = document.getElementById("currentWord");
  var hintButton = document.getElementById("hint");
  var currentEvent = document.getElementById("currentEvent");

  hintButton.disabled = true;

  // create a 2D drawing context to draw
  var context = canvas.getContext("2d");


  var socket = io.connect();

  var width = window.innerWidth;
  var height = window.innerHeight;

  // sets the canvas width and height properties to its container's size
  canvas.width = document.getElementById("container-canvas").offsetWidth;
  canvas.height = document.getElementById("container-canvas").offsetHeight;

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

    context.beginPath();
    context.lineWidth = 2;

    context.moveTo(
      line[0].x * width - offset.left,
      line[0].y * height - offset.top
    );

    context.lineTo(
      line[1].x * width - offset.left,
      line[1].y * height - offset.top
    );

    context.stroke();
  });

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
  //clearButton.disabled = true;
  clearButton.style.opacity = "0.5";

  clearButton.addEventListener("click", e => {
    socket.emit("clear", false);
    //document.getElementById("preWord").innerHTML = "Fail! Waiting for someone to generate a word";
  });

  var okButton = document.getElementById("ok");
  okButton.addEventListener("click", e => {
    socket.emit("clear", true);
  })

  socket.on("clearRect", success => {
    context.clearRect(0, 0, width, height);
    currentImage.src = "https://image.flaticon.com/icons/png/128/39/39293.png";
    generateButton.disabled = false;
    generateButton.style.opacity = "1";
    preWord.innerHTML = "The game has ended!\nTo become the host tap the Generate button.";
    currentWord.innerHTML = "";
    hintButton.disabled = true;
    okButton.style.opacity = "0";
    if (success) {
      currentEvent.innerHTML = "Success!";
    } else {
      currentEvent.innerHTML = "Fail!";
    }
  });

});
