setInterval(function() {
      document.querySelector("#dateTime").innerHTML = new Date().toLocaleString();
}, 1000);

function dragElement(element) {
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;

  if (document.getElementById(element.id + "header")) {
    document.getElementById(element.id + "header").onmousedown = startDragging;
  } else {
    element.onmousedown = startDragging;
  }

  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
  }

  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    
    var newTop = element.offsetTop - currentY
    var newLeft = element.offsetLeft - currentX

    if (newTop < 0) newTop = 0
    if (newLeft < 0) newLeft = 0

    element.style.top = newTop + "px";
    element.style.left = newLeft + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

var topBar = document.querySelector("#top");
var welcomeScreen = document.querySelector("#welcome");
var welcomeScreenOpen = document.querySelector("#welcomeopen");
var welcomeScreenClose = document.querySelector("#welcomeclose");

function closeWindow(element) {
    element.style.display = "none"
}

function openWindow(element) {
    element.style.display = "flex";
    biggestIndex++;  // Increment biggestIndex by 1
    element.style.zIndex = biggestIndex;
    topBar.style.zIndex = biggestIndex + 1;
}

welcomeScreenOpen.addEventListener("click", function() {
  openWindow(welcomeScreen);
});

initializeWindow("welcome");
initializeWindow("notes");
initializeWindow("map");

var selectedIcon = null;

function handleiconTap(icon, screen) {
  if (icon.classList.contains("selected")) {
    deselectIcon(icon);
    openWindow(screen);
  } else {
    selectIcon(icon);
  }
}

function initializeIcon(name) {
  var icon = document.querySelector("#" + name + "Icon")
  var screen = document.querySelector("#" + name)
  icon.addEventListener("click", () => handleiconTap(icon, screen))
}

function makeClosable(elementName) {
  var closeButton = document.querySelector("#" + elementName + "close");
  closeButton.addEventListener("click", function() {
      closeWindow(document.querySelector("#" + elementName));
  });
}

function selectIcon(icon) {
  icon.classList.add("selected");
  selectedIcon = icon;
}

function deselectIcon(icon) {
  icon.classList.remove("selected");
  selectedIcon = undefined;
}

var biggestIndex = 0;

function addWindowTapHandling(element) {
  element.addEventListener("mousedown", () => handleWindowTap(element));
}

function handleWindowTap(element) {
  biggestIndex++;
  element.style.zIndex = biggestIndex;
  topBar.style.zIndex = biggestIndex + 1;
  if (selectedIcon) {
    deselectIcon(selectedIcon);
  }
}

function initializeWindow(elementName) {
  var element = document.querySelector("#" + elementName);
  addWindowTapHandling(element);
  makeClosable(elementName);
  dragElement(element);
  if (elementName != "welcome") {
    initializeIcon(elementName);
  }
}

var canvas = document.querySelector("#paintCanvas")
var ctx = canvas.getContext("2d");
var painting = false;
var firstTime = true;

canvas.addEventListener("mousedown", function(e) {
    if (firstTime) {
      firstTime = false;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    painting = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", function(e) {
    if (!painting) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

canvas.addEventListener("mouseup", function() {
    painting = false;
});

canvas.addEventListener("mouseleave", function() {
    painting = false;
});

document.querySelector("#clearPaint").addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});