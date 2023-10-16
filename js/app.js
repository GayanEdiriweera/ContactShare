const rootStyle = getComputedStyle(document.documentElement);
const colors = {
  dark: rootStyle.getPropertyValue("--dark"),
  light: rootStyle.getPropertyValue("--light"),
};

const elements = {
  listView: document.getElementById("listView"),
  detailView: document.getElementById("detailView"),
  instructions: document.getElementById("instructions"),
  qrCodeCanvas: document.getElementById("qrCodeCanvas"),
  addContactInformation: document.getElementById("addContactInformation"),
  addWebLink: document.getElementById("addWebLink"),
  addReturnCall: document.getElementById("addReturnCall"),
  addReturnMessage: document.getElementById("addReturnMessage"),
  addReturnEmail: document.getElementById("addReturnEmail"),
  doneButton: document.getElementById("doneButton"),
  removeButton: document.getElementById("removeButton"),
};
elements.addContactInformation.addEventListener("click", () =>
  addItem(ItemType.ContactInformation)
);
elements.addWebLink.addEventListener("click", () => addItem(ItemType.WebLink));
elements.addReturnCall.addEventListener("click", () =>
  addItem(ItemType.ReturnCall)
);
elements.addReturnMessage.addEventListener("click", () =>
  addItem(ItemType.ReturnMessage)
);
elements.addReturnEmail.addEventListener("click", () =>
  addItem(ItemType.ReturnEmail)
);

const ItemType = {
  ContactInformation: "ContactInformation",
  WebLink: "WebLink",
  ReturnCall: "ReturnCall",
  ReturnMessage: "ReturnMessage",
  ReturnEmail: "ReturnEmail",
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

function isItemEmpty(item) {
  if (item.type === ItemType.ContactInformation)
    return (
      !item.firstName &&
      !item.lastName &&
      !item.phoneNumber &&
      !item.emailAddress
    );
  else if (item.type === ItemType.WebLink) return !item.webLink;
  else if (item.type === ItemType.ReturnCall) {
    return !item.phoneNumber;
  } else if (item.type === ItemType.ReturnMessage) {
    return !item.phoneNumber;
  } else if (item.type === ItemType.ReturnEmail) {
    return !item.emailAddress;
  }
}

function itemToString(item) {
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
  } else if (item.type == ItemType.WebLink) {
    return item.webLink;
  } else if (item.type === ItemType.ReturnCall) {
    return `Return Call: ${item.phoneNumber}`;
  } else if (item.type === ItemType.ReturnMessage) {
    return `Return Message: ${item.phoneNumber}`;
  } else if (item.type === ItemType.ReturnEmail) {
    return `Return Email: ${item.emailAddress}`;
  }
}

function itemInstructions(item) {
  if (item.type === ItemType.ContactInformation) {
    return "Enter information to make QR Code. Scanner will be prompted to add the contact information into address book.";
  } else if (item.type == ItemType.WebLink) {
    return "Enter information to make QR Code. Scanner will be prompted to open the link.";
  } else if (item.type === ItemType.ReturnCall) {
    return "Enter information to make QR Code. Scanner will be prompted to call the number.";
  } else if (item.type === ItemType.ReturnMessage) {
    return "Enter information to make QR Code. Scanner will be prompted to message the number.";
  } else if (item.type === ItemType.ReturnEmail) {
    return "Enter information to make QR Code. Scanner will be prompted to email the address.";
  }
}

function itemToEncodedData(item) {
  if (item.type === ItemType.ContactInformation) {
    return vcard.buildContactCard(
      item.firstName ?? "",
      item.lastName ?? "",
      item.phoneNumber ?? "",
      item.emailAddress ?? ""
    );
  } else if (item.type == ItemType.WebLink) {
    return encodeURI(item.webLink ?? "");
  } else if (item.type === ItemType.ReturnCall) {
    return `tel:${item.phoneNumber ?? ""}`;
  } else if (item.type === ItemType.ReturnMessage) {
    return `sms:${item.phoneNumber ?? ""}`;
  } else if (item.type === ItemType.ReturnEmail) {
    return encodeURI(`mailto:${item.emailAddress ?? ""}`);
  }
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
    itemElement.textContent = itemToString(allItems[key]);
    itemElement.addEventListener("click", () => setActiveItem(key));
    return itemElement;
  });
  elements.listView
    .querySelector("#list-area")
    .replaceChildren(...listElements);
}

function populateDetailView() {
  const activeItem = allItems[activeItemKey];
  instructions.innerHTML = itemInstructions(activeItem);
  const inputElements = createInputElementsForItem(activeItem);
  elements.detailView
    .querySelector("#input-area")
    .replaceChildren(...inputElements);

  qrcanvas.encodeAndDrawToCanvas(
    qrCodeCanvas,
    itemToEncodedData(activeItem),
    colors
  );
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
        qrcanvas.encodeAndDrawToCanvas(
          qrCodeCanvas,
          itemToEncodedData(itemData),
          colors
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
      qrcanvas.encodeAndDrawToCanvas(
        qrCodeCanvas,
        itemToEncodedData(itemData),
        colors
      );
    };

    inputElements.push(webLinkElement);
  } else if (itemData.type == ItemType.ReturnCall) {
    const phoneNumberElement = document.createElement("input");
    phoneNumberElement.type = "tel";
    phoneNumberElement.name = "phoneNumber";
    phoneNumberElement.placeholder = "My Phone Number";
    phoneNumberElement.value = itemData.phoneNumber || "";

    phoneNumberElement.oninput = (event) => {
      itemData.phoneNumber = event.target.value;
      storeItems();
      qrcanvas.encodeAndDrawToCanvas(
        qrCodeCanvas,
        itemToEncodedData(itemData),
        colors
      );
    };

    inputElements.push(phoneNumberElement);
  } else if (itemData.type == ItemType.ReturnMessage) {
    const phoneNumberElement = document.createElement("input");
    phoneNumberElement.type = "tel";
    phoneNumberElement.name = "phoneNumber";
    phoneNumberElement.placeholder = "My Number";
    phoneNumberElement.value = itemData.phoneNumber || "";

    phoneNumberElement.oninput = updateReturnMessageQR;

    function updateReturnMessageQR(event) {
      if (event.target.name === "phoneNumber") {
        itemData.phoneNumber = event.target.value;
      }

      storeItems();
      qrcanvas.encodeAndDrawToCanvas(
        qrCodeCanvas,
        itemToEncodedData(itemData),
        colors
      );
    }

    inputElements.push(phoneNumberElement);
  } else if (itemData.type == ItemType.ReturnEmail) {
    const emailAddressElement = document.createElement("input");
    emailAddressElement.type = "email";
    emailAddressElement.name = "emailAddress";
    emailAddressElement.placeholder = "Email Address";
    emailAddressElement.value = itemData.emailAddress || "";

    emailAddressElement.oninput = updateReturnEmailQR;

    function updateReturnEmailQR(event) {
      if (event.target.name === "emailAddress") {
        itemData.emailAddress = event.target.value;
      }

      storeItems();
      qrcanvas.encodeAndDrawToCanvas(
        qrCodeCanvas,
        itemToEncodedData(itemData),
        colors
      );
    }

    inputElements.push(emailAddressElement);
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

function initializeItem(type) {
  if (type === ItemType.ContactInformation)
    return {
      type,
      firstName: "",
      lastName: "",
      phoneNumber: "",
      emailAddress: "",
    };
  else if (type === ItemType.WebLink) return { type, webLink: "" };
  else if (type === ItemType.ReturnCall) return { type, phoneNumber: "" };
  else if (type === ItemType.ReturnMessage) return { type, phoneNumber: "" };
  else if (type === ItemType.ReturnEmail) return { type, emailAddress: "" };
}

function addItem(type) {
  const id = Date.now();
  allItems[id] = initializeItem(type);
  storeItems();
  setActiveItem(id);
}

elements.doneButton.addEventListener("click", finalizeActiveItem);
elements.removeButton.addEventListener("click", removeActiveItem);

function finalizeActiveItem() {
  if (isItemEmpty(allItems[activeItemKey])) delete allItems[activeItemKey];
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
    if (isItemEmpty(allItems[key])) {
      delete allItems[key];
    }
  }
  storeItems();
}

function showDropdown(id) {
  document.getElementById(id).classList.toggle("show");
}

document.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    Array.from(dropdowns).forEach((dropdown) =>
      dropdown.classList.remove("show")
    );
  }
};
