class vcard {
  static buildPhoneCard(firstname, lastname, phone) {
    return `\
BEGIN:VCARD
VERSION:4.0
FN:${escape(firstname)} ${escape(lastname)}
TEL:${escape(phone)}
END:VCARD`;
  }

  static buildEmailCard(firstname, lastname, email) {
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
