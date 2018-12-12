var socket = io.connect();

var randomWord = "";
var currentWord = document.getElementById("currentWord");
var preWord = document.getElementById("preWord");
var okButton = document.getElementById("ok");
var generateButton = document.getElementById("generate");
var hintButton = document.getElementById("hint");
var currentImage = document.getElementById("currentImage");

var questionMark = "https://image.flaticon.com/icons/png/128/39/39293.png";

socket.emit("getList");

socket.on("getRand", rng => {
  randomWord = rng;
  generateButton.disabled = true;
  generateButton.style.opacity = "0.5";
  document.getElementById("hint").disabled = false;
  preWord.innerHTML = "";
  //currentWord.innerHTML = "Your opponent has generated a word";
  console.log(randomWord);
  currentImage.src = questionMark;
});

generateButton.addEventListener("click", () => {
  socket.emit("getRand");
  preWord.innerHTML = "";
  currentWord.innerHTML = randomWord;
  okButton.style.opacity = "1";
});

hintButton.addEventListener("click", () => {
  socket.emit("displayImage", randomWord);
});

socket.on("displayImage", url => {
  console.log("test", url);
  var img = (document.getElementById("currentImage").src = url);
});
