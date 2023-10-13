const elements = {
  listView: document.getElementById("listView"),
  detailView: document.getElementById("detailView"),
  qrCodeCanvas: document.getElementById("qrCodeCanvas"),
  addContactInformation: document.getElementById("addContactInformation"),
  addWebLink: document.getElementById("addWebLink"),
  doneButton: document.getElementById("doneButton"),
  removeButton: document.getElementById("removeButton"),
};

const ItemType = {
  ContactInformation: "ContactInformation",
  WebLink: "WebLink",
};

const DATA_VERSION = "1";
const dataVersion = localStorage.getItem("dataVersion");
if (dataVersion !== DATA_VERSION) {
  localStorage.clear();
  localStorage.setItem("dataVersion", DATA_VERSION);
}

let allItems = loadItems();
let activeItemKey = null;

removeEmptyItemsFromAllItems();
updateView();

function refreshCanvas(canvas, text) {
  const code = text
    ? qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM)
    : { size: 0 };
  canvas.style.display = code.size ? "block" : "none";
  if (code.size) drawCodeToCanvas(canvas, code);
}

function drawCodeToCanvas(canvas, code) {
  const { dark, light } = getColors();
  const context = canvas.getContext("2d");
  canvas.width = code.size + 4;
  canvas.height = code.size + 4;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      context.fillStyle = getFillStyle(x, y, canvas, code, dark, light);
      context.fillRect(x, y, 1, 1);
    }
  }
}

function getFillStyle(x, y, canvas, code, dark, light) {
  const isOuterOutline =
    x == 0 || y == 0 || x == canvas.width - 1 || y == canvas.height - 1;
  const isInnerOutline =
    x == 1 || y == 1 || x == canvas.width - 2 || y == canvas.height - 2;
  if (isOuterOutline) return dark;
  if (isInnerOutline) return light;
  return code.modules[y - 2][x - 2] ? dark : light;
}

function getColors() {
  const rootStyle = getComputedStyle(document.documentElement);
  return {
    dark: rootStyle.getPropertyValue("--dark"),
    light: rootStyle.getPropertyValue("--light"),
  };
}

function itemDataToString(item) {
  if (item.type === ItemType.ContactInformation) {
    const components = [];

    if (item.firstName || item.lastName) {
      components.push(`${item.firstName} ${item.lastName}`.trim());
    }

    if (item.phoneNumber) {
      components.push(item.phoneNumber);
    }

    if (item.emailAddress) {
      components.push(item.emailAddress);
    }

    return components.join("\r\n");
  }

  return item.webLink;
}

function isEmpty(item) {
  return item.type === ItemType.ContactInformation
    ? !item.firstName &&
        !item.lastName &&
        !item.phoneNumber &&
        !item.emailAddress
    : !item.webLink;
}

function updateView() {
  elements.listView.style.display = !activeItemKey ? "block" : "none";
  elements.detailView.style.display = activeItemKey ? "block" : "none";

  if (!activeItemKey) {
    populateListView();
  } else {
    populateDetailView();
  }
}

function populateListView() {
  const listElements = Object.keys(allItems).map((key) => {
    const itemElement = document.createElement("div");
    itemElement.className = "item";
    itemElement.textContent = itemDataToString(allItems[key]);
    itemElement.addEventListener("click", () => setActiveItem(key));
    return itemElement;
  });
  elements.listView
    .querySelector("#list-area")
    .replaceChildren(...listElements);
}

function populateDetailView() {
  const activeItem = allItems[activeItemKey];
  const inputElements = createInputElementsForItem(activeItem);
  elements.detailView
    .querySelector("#input-area")
    .replaceChildren(...inputElements);
  // Move the canvas refreshing logic here
  if (activeItem.type == ItemType.ContactInformation) {
    refreshCanvas(
      qrCodeCanvas,
      vcard.buildContactCard(
        activeItem.firstName ?? "",
        activeItem.lastName ?? "",
        activeItem.phoneNumber ?? "",
        activeItem.emailAddress ?? ""
      )
    );
  } else if (activeItem.type == ItemType.WebLink) {
    refreshCanvas(qrCodeCanvas, activeItem.webLink ?? "");
  }
}

function createInputElementsForItem(itemData) {
  let inputElements = [];

  if (itemData.type == ItemType.ContactInformation) {
    const fields = [
      { name: "firstName", type: "text", placeholder: "First Name" },
      { name: "lastName", type: "text", placeholder: "Last Name" },
      { name: "phoneNumber", type: "tel", placeholder: "Phone Number" },
      { name: "emailAddress", type: "email", placeholder: "Email Address" },
    ];

    fields.forEach((field) => {
      const inputElement = document.createElement("input");
      inputElement.type = field.type;
      inputElement.name = field.name;
      inputElement.placeholder = field.placeholder;
      inputElement.value = itemData[field.name] || "";

      inputElement.oninput = (event) => {
        itemData[field.name] = event.target.value;
        storeItems();
        refreshCanvas(
          qrCodeCanvas,
          vcard.buildContactCard(
            itemData.firstName ?? "",
            itemData.lastName ?? "",
            itemData.phoneNumber ?? "",
            itemData.emailAddress ?? ""
          )
        );
      };

      inputElements.push(inputElement);
    });
  } else if (itemData.type == ItemType.WebLink) {
    const webLinkElement = document.createElement("input");
    webLinkElement.type = "url";
    webLinkElement.name = "webLink";
    webLinkElement.placeholder = "Web Link";
    webLinkElement.value = itemData.webLink || "";

    webLinkElement.oninput = (event) => {
      itemData.webLink = event.target.value;
      storeItems();
      refreshCanvas(qrCodeCanvas, itemData.webLink ?? "");
    };

    inputElements.push(webLinkElement);
  }

  return inputElements;
}

function setActiveItem(key) {
  activeItemKey = key;
  updateView();
}

function loadItems() {
  return JSON.parse(localStorage.getItem("items") || "{}");
}

function storeItems() {
  localStorage.setItem("items", JSON.stringify(allItems));
}

elements.addContactInformation.addEventListener("click", () =>
  addItem(ItemType.ContactInformation)
);
elements.addWebLink.addEventListener("click", () => addItem(ItemType.WebLink));

function addItem(type) {
  const id = Date.now();
  allItems[id] =
    type === ItemType.ContactInformation
      ? { type, firstName: "", lastName: "", phoneNumber: "", emailAddress: "" }
      : { type, webLink: "" };
  storeItems();
  setActiveItem(id);
}

elements.doneButton.addEventListener("click", finalizeActiveItem);
elements.removeButton.addEventListener("click", removeActiveItem);

function finalizeActiveItem() {
  if (isEmpty(allItems[activeItemKey])) delete allItems[activeItemKey];
  storeItems();
  activeItemKey = null;
  updateView();
}

function removeActiveItem() {
  delete allItems[activeItemKey];
  storeItems();
  activeItemKey = null;
  updateView();
}

function removeEmptyItemsFromAllItems() {
  for (let key in allItems) {
    if (isEmpty(allItems[key])) {
      delete allItems[key];
    }
  }
  storeItems();
}

function showDropdown(id) {
  document.getElementById(id).classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    Array.from(dropdowns).forEach((dropdown) =>
      dropdown.classList.remove("show")
    );
  }
};
