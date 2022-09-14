import { buildVCard } from "./vcard.js";

var rootStyle = getComputedStyle(document.querySelector(":root"));
var dark = rootStyle.getPropertyValue("--dark");
var light = rootStyle.getPropertyValue("--light");

let header = document.getElementById("header");
let headerCanvasContainer = document.getElementById("header-canvas-container");
let canvas2d = document.getElementById("canvas-2d");
let context2d = canvas2d.getContext("2d");

function codeContainerSizePixels() {
  const codeAnimation = true;

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

document.getElementById("firstname").addEventListener("input", onValueChanged);
document.getElementById("lastname").addEventListener("input", onValueChanged);
document.getElementById("phone").addEventListener("input", onValueChanged);
document.getElementById("email").addEventListener("input", onValueChanged);
document.getElementById("url").addEventListener("input", onValueChanged);
document.getElementById("url2").addEventListener("input", onValueChanged);
document.getElementById("url3").addEventListener("input", onValueChanged);

header.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

let userData = {
  firstname: "",
  lastname: "",
  phones: [],
  emails: [],
  links: [],
};
function onValueChanged(event) {
  const id = event.target.id;
  userData[id] = event.target.value;
  saveUserData(userData);
  rebuild();
}

function rebuild() {
  let vCard = buildVCard(
    userData["firstname"],
    userData["lastname"],
    [{ type: "cell", parameter: userData["phone"] }],
    [{ type: "", parameter: userData["email"] }],
    [
      { type: "", parameter: userData["url"] },
      { type: "", parameter: userData["url2"] },
      { type: "", parameter: userData["url3"] },
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
  const userDataString = localStorage.getItem("userData") ?? "{}";
  return JSON.parse(userDataString);
}

window.addEventListener("load", (event) => {
  userData = loadUserData();
  for (const key of Object.keys(userData)) {
    if (!document.getElementById(key)) {
      delete userData[key];
      continue;
    }
    document.getElementById(key).value = userData[key];
  }
  rebuild();
  updateCodeContainerHeight(event);
});

window.addEventListener("scroll", (event) => {
  updateCodeContainerHeight();
});
window.addEventListener("resize", (event) => {
  updateCodeContainerHeight();
});
