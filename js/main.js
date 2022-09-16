import { buildVCard } from "./vcard.js";

let version = "1.0.1";
let activePassIndex = 0;
let passes = [
  {
    type: "contact",
    name: "Personal",
    data: {},
  },
  {
    type: "contact",
    name: "Work",
    data: {},
  },
  {
    type: "note",
    name: "Note",
    data: { text: "Hello world!" },
  },
];

var rootStyle = getComputedStyle(document.querySelector(":root"));
var dark = rootStyle.getPropertyValue("--dark");
var light = rootStyle.getPropertyValue("--light");

let presenter = document.getElementById("presenter");
let canvasContainer = document.getElementById("canvas-container");
let canvas2d = document.getElementById("canvas-2d");
let context2d = canvas2d.getContext("2d");
let tabs = document.getElementById("tabs");
tabs.addEventListener("click", (event) => {
  let elements = Array.from(tabs.children);
  activePassIndex = elements.indexOf(event.target);

  refreshTabs();
  refreshEditor(passes[activePassIndex]);
  refreshPresenter(passes[activePassIndex]);
});

function refreshTabs() {
  while (tabs.childElementCount > passes.length) {
    tabs.removeChild(tabs.firstElementChild());
  }
  while (tabs.childElementCount < passes.length) {
    let tab = document.createElement("div");
    tab.className = "tab";
    tabs.appendChild(tab);
  }
  let elements = Array.from(tabs.children);
  for (let i = 0; i < elements.length; i++) {
    let tab = elements[i];
    tab.innerHTML = passes[i].name;
    tab.setAttribute("active", i == activePassIndex);
    tab.setAttribute("first", i == 0);
    tab.setAttribute("last", i == elements.length - 1);
  }
}

function codeContainerSizePixels() {
  return Math.max(
    Math.min(
      presenter.clientWidth,
      presenter.clientHeight - presenter.clientTop
    ) - document.documentElement.scrollTop,
    0
  );
}

function updateCodeContainerHeight() {
  let newSizePixels = codeContainerSizePixels();
  let newSizePercent = (newSizePixels / presenter.clientHeight) * 100;
  canvasContainer.style.height = newSizePercent.toString() + "%";
  canvasContainer.style.height = newSizePercent.toString() + "%";

  // This is a hack to force ios to reflow content when scrolling to input focus
  canvasContainer.style.display = "none";
  canvasContainer.offsetHeight;
  canvasContainer.style.display = "";
}

presenter.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function refreshEditor(activePass) {
  let editors = document.querySelectorAll("[editor]");
  let editorSelector = "[editor=" + activePass.type + "]";
  let editor = document.querySelector(editorSelector);

  for (var i = 0; i < editors.length; i++) {
    var e = editors[i];
    e.style.display = e == editor ? "block" : "none";
  }

  let elements = document.querySelectorAll(
    editorSelector + " input, " + editorSelector + " textarea"
  );
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    let key = element.id;
    if (!activePass.data.hasOwnProperty(key)) {
      activePass.data[key] = "";
    }
    element.value = activePass.data[key];
    element.oninput = (event) => {
      activePass.data[key] = event.target.value;
      saveUserData(passes);
      refreshPresenter(activePass);
    };
  }
}

function refreshPresenter(activePass) {
  let data = "";
  switch (activePass.type) {
    case "contact":
      data = buildVCard(
        activePass.data["firstname"],
        activePass.data["lastname"],
        [{ type: "cell", parameter: activePass.data["phone"] }],
        [{ type: "", parameter: activePass.data["email"] }],
        [
          { type: "", parameter: activePass.data["url"] },
          { type: "", parameter: activePass.data["url2"] },
          { type: "", parameter: activePass.data["url3"] },
          { type: "Made with", parameter: "https://pass.contact" },
        ]
      );
      break;
    case "note":
      data = activePass.data["text"];
      break;
  }
  let code = qrcodegen.QrCode.encodeText(data, qrcodegen.QrCode.Ecc.MEDIUM);
  renderCanvas2d(canvas2d, context2d, code, dark, light);
}

function renderCanvas2d(canvas, context, code, dark, light) {
  canvas.width = code.size;
  canvas.height = code.size;

  for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
      context.fillStyle = code.modules[y][x] ? dark : light;
      context.fillRect(x, y, 1, 1);
    }
  }
}

function saveUserData(userData) {
  const userDataString = JSON.stringify(userData);
  localStorage.setItem("userData", userDataString);
}

function loadUserData() {
  if (localStorage.getItem("version") != version) {
    localStorage.clear();
    localStorage.setItem("version", version);
  }

  const userDataString = localStorage.getItem("userData");
  if (userDataString) {
    return JSON.parse(userDataString);
  }
  return passes;
}

window.addEventListener("load", (event) => {
  passes = loadUserData();
  refreshEditor(passes[activePassIndex]);
  refreshPresenter(passes[activePassIndex]);
  updateCodeContainerHeight(event);
  refreshTabs(passes);
});

window.addEventListener("scroll", (event) => {
  updateCodeContainerHeight();
});
window.addEventListener("resize", (event) => {
  updateCodeContainerHeight();
});
