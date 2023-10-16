class vcard {
  static buildContactCard(firstname, lastname, phone, email) {
    if (!firstname && !lastname && !phone && !email) {
      return "";
    }
    return `\
BEGIN:VCARD
VERSION:4.0
FN:${escape(firstname)} ${escape(lastname)}
TEL:${escape(phone)}
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
