class vcard {
  static buildPhoneCard(firstname, lastname, phone) {
    if (!firstname && !lastname && !phone) {
      return "";
    }
    return `\
BEGIN:VCARD
VERSION:4.0
FN:${escape(firstname)} ${escape(lastname)}
TEL:${escape(phone)}
END:VCARD`;
  }

  static buildEmailCard(firstname, lastname, email) {
    if (!firstname && !lastname && !email) {
      return "";
    }
    return `\
BEGIN:VCARD
VERSION:4.0
FN:${escape(firstname)} ${escape(lastname)}
EMAIL:${escape(email)}
END:VCARD`;
  }
}

function escape(text) {
  // RFC says must not escape any other characters
  return text
    .replaceAll("\\", `\\\\`)
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", `\\;`);
}
