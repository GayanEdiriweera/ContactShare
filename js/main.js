import { buildVCard } from "./vcard.js";

var modal = document.getElementById("modal");

let canvas = document.getElementById("qr-code-canvas");
let context = canvas.getContext("2d");

document.getElementById("firstname").addEventListener("input", onValueChanged);
document.getElementById("lastname").addEventListener("input", onValueChanged);
document.getElementById("phone").addEventListener("input", onValueChanged);
document.getElementById("email").addEventListener("input", onValueChanged);

document
  .getElementById("modal-close-button")
  .addEventListener("click", (event) => {
    modal.style.display = "none";
  });

document.getElementById("qr-code-button").addEventListener("click", () => {
  modal.style.display = "block";
  rebuild();
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

let userData = {
  firstname: "",
  lastname: "",
  phone: "",
  email: "",
};
function onValueChanged(event) {
  const id = event.target.id;
  userData[id] = event.target.value;
  saveUserData(userData);
}

function rebuild() {
  let vCard = buildVCard(
    userData["firstname"],
    userData["lastname"],
    [{ type: "", parameter: userData["phone"] }],
    [{ type: "", parameter: userData["email"] }],
    [{ type: "Made by", parameter: "https://pass.contact" }]
  );
  let code = qrcodegen.QrCode.encodeText(vCard, qrcodegen.QrCode.Ecc.MEDIUM);
  updateCanvas(code);
}

function updateCanvas(code) {
  canvas.width = code.size;
  canvas.height = code.size;

  let black = "rgb(0,0,0)";
  let white = "rgb(255,255,255)";
  for (var y = 0; y < code.modules.length; y++) {
    for (var x = 0; x < code.modules[y].length; x++) {
      context.fillStyle = code.modules[y][x] ? black : white;
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
    document.getElementById(key).value = userData[key];
  }
});
