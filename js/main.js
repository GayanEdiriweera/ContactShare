import { buildVCard } from "./vcard.js";

let version = "1.0.0";
let activeProfileIndex = 0;
let userData = [
  {
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    url: "",
    url2: "",
    url3: "",
  },
  {
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    url: "",
    url2: "",
    url3: "",
  },
];

var rootStyle = getComputedStyle(document.querySelector(":root"));
var dark = rootStyle.getPropertyValue("--dark");
var light = rootStyle.getPropertyValue("--light");

let header = document.getElementById("header");
let headerCanvasContainer = document.getElementById("header-canvas-container");
let canvas2d = document.getElementById("canvas-2d");
let context2d = canvas2d.getContext("2d");
let tabs = document.getElementById("tabs");

document.getElementById("firstname").addEventListener("input", onValueChanged);
document.getElementById("lastname").addEventListener("input", onValueChanged);
document.getElementById("phone").addEventListener("input", onValueChanged);
document.getElementById("email").addEventListener("input", onValueChanged);
document.getElementById("url").addEventListener("input", onValueChanged);
document.getElementById("url2").addEventListener("input", onValueChanged);
document.getElementById("url3").addEventListener("input", onValueChanged);

tabs.addEventListener("click", (event) => {
  let children = Array.from(tabs.children);
  activeProfileIndex = children.indexOf(event.target);

  for (let i = 0; i < children.length; i++) {
    if (i == activeProfileIndex) {
      children[i].className = "active-tab";
    } else {
      children[i].className = "inactive-tab";
    }
  }
  refillData();
  rebuild();
});

function codeContainerSizePixels() {
  const codeAnimation = false;
  if (codeAnimation) {
    return Math.max(
      Math.min(header.clientWidth, header.clientHeight - header.clientTop) -
        document.documentElement.scrollTop,
      0
    );
  } else {
    return header.clientHeight;
  }
}

function updateCodeContainerHeight() {
  let newSize = codeContainerSizePixels();
  headerCanvasContainer.style.height = newSize.toString() + "px";

  // This is a hack to force ios to reflow content when scrolling to input focus
  headerCanvasContainer.style.display = "none";
  headerCanvasContainer.offsetHeight;
  headerCanvasContainer.style.display = "";
}

header.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function onValueChanged(event) {
  const id = event.target.id;
  userData[activeProfileIndex][id] = event.target.value;
  saveUserData(userData);
  rebuild();
}

function refillData() {
  for (const key of Object.keys(userData[activeProfileIndex])) {
    document.getElementById(key).value = userData[activeProfileIndex][key];
  }
}

function rebuild() {
  let vCard = buildVCard(
    userData[activeProfileIndex]["firstname"],
    userData[activeProfileIndex]["lastname"],
    [{ type: "cell", parameter: userData[activeProfileIndex]["phone"] }],
    [{ type: "", parameter: userData[activeProfileIndex]["email"] }],
    [
      { type: "", parameter: userData[activeProfileIndex]["url"] },
      { type: "", parameter: userData[activeProfileIndex]["url2"] },
      { type: "", parameter: userData[activeProfileIndex]["url3"] },
      { type: "Made with", parameter: "https://pass.contact" },
    ]
  );
  let code = qrcodegen.QrCode.encodeText(vCard, qrcodegen.QrCode.Ecc.MEDIUM);
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

  const userDataString =
    localStorage.getItem("userData") ?? JSON.stringify(userData);
  return JSON.parse(userDataString);
}

window.addEventListener("load", (event) => {
  userData = loadUserData();
  refillData();
  rebuild();
  updateCodeContainerHeight(event);
});

window.addEventListener("scroll", (event) => {
  updateCodeContainerHeight();
});
window.addEventListener("resize", (event) => {
  updateCodeContainerHeight();
});
