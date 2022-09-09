import { buildVCard } from "./vcard.js";

var header = document.getElementById("header");
var modalBackground = document.getElementById("modal-background");

let canvas = document.getElementById("qr-code-canvas");
let context = canvas.getContext("2d");

document.getElementById("firstname").addEventListener("input", onValueChanged);
document.getElementById("lastname").addEventListener("input", onValueChanged);
document.getElementById("phone").addEventListener("input", onValueChanged);
document.getElementById("email").addEventListener("input", onValueChanged);
document.getElementById("linkedin").addEventListener("input", onValueChanged);

let passMode = false;
header.addEventListener("click", () => {
  if (!passMode) {
    modalBackground.style.display = "block";
    header.style.height = "100vw";
    passMode = true;
  }
});

let eventsArray = ["click", "touchstart", "touchend"];
eventsArray.forEach(function (eventName) {
  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener(eventName, function (event) {
    if (event.target === modalBackground) {
      if (passMode) {
        modalBackground.style.display = "none";
        header.style.height = "4rem";
        passMode = false;
      }
    }
  });
});

let userData = {
  firstname: "",
  lastname: "",
  phone: "",
  email: "",
  linkedin: "",
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
      { type: "LinkedIn", parameter: userData["linkedin"] },
      { type: "Made with", parameter: "https://pass.contact" },
    ]
  );
  let code = qrcodegen.QrCode.encodeText(vCard, qrcodegen.QrCode.Ecc.MEDIUM);
  updateCanvas(code);
}

function updateCanvas(code) {
  // render code with 1 module border
  canvas.width = code.size + 2;
  canvas.height = code.size + 2;

  let black = "rgb(0,0,0)";
  let white = "rgb(255,255,255)";

  for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
      let isBorder =
        x == 0 || y == 0 || x == canvas.height - 1 || y == canvas.height - 1;

      context.fillStyle =
        !isBorder && code.modules[y - 1][x - 1] ? black : white;
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
  rebuild();
  for (const key of Object.keys(userData)) {
    document.getElementById(key).value = userData[key];
  }
});
