setInterval(function () {
  var now = new Date();
  document.querySelector("#dateTime").innerHTML = now.getHours() % 12 + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + "<br>" + (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();
}, 1000);

function dragElement(element) {
  var initialX = 0;
  var initialY = 0;

  const header = document.getElementById(element.id + "header");

  if (header) {
    header.onmousedown = startDragging;
  } else {
    element.onmousedown = startDragging;
  }

  function startDragging(e) {
    if (element.classList.contains("fullscreen")) {
      return;
    }

    e.preventDefault();

    initialX = e.clientX;
    initialY = e.clientY;

    document.onmouseup = stopDragging;
    document.onmousemove = dragWindow;
  }

  function dragWindow(e) {
    e.preventDefault();

    const deltaX = e.clientX - initialX;
    const deltaY = e.clientY - initialY;

    const rect = element.getBoundingClientRect();

    let x = rect.left + deltaX;
    let y = rect.top + deltaY;

    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    // Remove the centering transform after dragging starts
    element.style.transform = "none";
    element.style.left = x + "px";
    element.style.top = y + "px";

    initialX = e.clientX;
    initialY = e.clientY;
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function openWindow(element) {
  if (!element) {
    return;
  }

  element.style.display = "flex";

  biggestIndex++;
  element.style.zIndex = biggestIndex;

  if (element.id === "home") {
    if (recentApps.length === 0) {
      document.querySelector("#emptyAppsMessage").style.display = "block";
    } else {
      document.querySelector("#emptyAppsMessage").style.display = "none";
    }
  }

  if (element.id !== "home" && element.id !== "welcome") {
    addToTaskbar(element.id);
  }
}

function closeWindow(element) {
  element.style.display = "none"
  removeFromTaskbar(element.id);
}

function handleiconTap(icon, screen) {
  if (icon.classList.contains("selected")) {
    deselectIcon(icon);
    openWindow(screen);
    if (screen.id != "home") {
      recentApps = recentApps.filter(appId => appId !== screen.id);
      recentApps.push(screen.id);
      if (recentApps.length > 5) {
        recentApps.shift();
      }
      localStorage.setItem("recentApps", JSON.stringify(recentApps));
      renderRecentApps();
    }
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
  closeButton.addEventListener("click", function () {
    closeWindow(document.querySelector("#" + elementName));
  });
}

function makeFullscreenable(elementName) {
  const button = document.querySelector("#" + elementName + "fullscreen");
  const element = document.querySelector("#" + elementName);

  if (!button) {
    console.error("Fullscreen button not found:", "#" + elementName + "fullscreen");
    return;
  }

  button.addEventListener("click", function (e) {
    e.stopPropagation();
    element.classList.toggle("fullscreen");

    if (element.classList.contains("fullscreen")) {
      biggestIndex++;
      element.style.zIndex = biggestIndex;
    }
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

function addWindowTapHandling(element) {
  element.addEventListener("mousedown", () => handleWindowTap(element));
}

function handleWindowTap(element) {
  biggestIndex++;
  element.style.zIndex = biggestIndex;
  if (selectedIcon) {
    deselectIcon(selectedIcon);
  }
}

function initializeWindow(elementName) {
  var element = document.querySelector("#" + elementName);
  addWindowTapHandling(element);
  makeClosable(elementName);
  makeFullscreenable(elementName);
  dragElement(element);
  if (elementName != "welcome") {
    initializeIcon(elementName);
  }
}


function renderRecentApps() {
  const container = document.querySelector("#recentApps");
  const emptyMessage = document.querySelector("#emptyAppsMessage");

  container.innerHTML = "";

  if (recentApps.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  recentApps.forEach(appId => {
    const originalIcon = document.querySelector("#" + appId + "Icon");
    const screen = document.querySelector("#" + appId);

    if (!originalIcon || !screen) return;

    const icon = originalIcon.cloneNode(true);
    icon.classList.remove("selected");

    icon.addEventListener("click", function (e) {
      e.stopPropagation();
      openWindow(screen);

      recentApps = recentApps.filter(id => id !== appId);
      recentApps.push(appId);

      localStorage.setItem("recentApps", JSON.stringify(recentApps));
      renderRecentApps();
    });

    container.appendChild(icon);
  });
}

function addToTaskbar(elementName) {
  console.log("[addToTaskbar] Called for:", elementName);

  const taskbar = document.querySelector("#taskbar");

  const icon = document.querySelector("#" + elementName + "Icon");

  if (!taskbar) {
    return;
  }

  if (!icon) {
    return;
  }

  const existingIcon = document.querySelector("#taskbar-" + elementName);

  if (existingIcon) {
    return;
  }

  const taskbarIcon = icon.cloneNode(true);
  taskbarIcon.id = "taskbar-" + elementName;
  taskbarIcon.className = "taskbar-icon";
  taskbarIcon.classList.remove("selected");

  taskbarIcon.addEventListener("click", function () {
    console.log("[taskbar icon] Clicked:", elementName);

    const appWindow = document.querySelector("#" + elementName);

    if (!appWindow) {
      console.error("[taskbar icon] Window not found:", elementName);
      return;
    }

    openWindow(appWindow);
  });

  taskbar.appendChild(taskbarIcon);
}

function removeFromTaskbar(elementName) {

  const icon = document.querySelector("#taskbar-" + elementName);

  if (icon) {
    icon.remove();
  }
}

var canvas = document.querySelector("#paintCanvas")
var ctx = canvas.getContext("2d");
var painting = false;
var firstTime = true;

canvas.addEventListener("mousedown", function (e) {
  if (firstTime) {
    firstTime = false;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  painting = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", function (e) {
  if (!painting) return;

  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener("mouseup", function () {
  painting = false;
});

canvas.addEventListener("mouseleave", function () {
  painting = false;
});

document.querySelector("#clearPaint").addEventListener("click", function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

var welcomeScreen = document.querySelector("#welcome");
var welcomeScreenClose = document.querySelector("#welcomeclose");
var notesContent = document.querySelector("#noteContent");
var searchButton = document.querySelector("#searchButton");
let recentApps = JSON.parse(localStorage.getItem("recentApps")) || [];
var selectedIcon = null;
var biggestIndex = 0;

localStorage.setItem("visitedBefore", true);
initializeWindow("home");
initializeWindow("welcome");
initializeWindow("websearch");
if (localStorage.getItem("visitedBefore")) {
  closeWindow(welcomeScreen);
}
initializeWindow("notes");
initializeWindow("map");
initializeWindow("tracker");
initializeWindow("settings");
renderRecentApps();

notesContent.innerHTML = localStorage.getItem("noteContent") || "Write notes about rotations and strategies here";

notesContent.addEventListener("input", function () {
  localStorage.setItem("noteContent", notesContent.innerHTML);
});

searchButton.addEventListener("click", function () {
  var searchQuery = document.querySelector("#websearchText").innerText;
  if (searchQuery.trim() !== "") {
    var searchUrl = "https://www.google.com/search?q=" + encodeURIComponent(searchQuery);
    window.open(searchUrl, "_blank");
  }
});