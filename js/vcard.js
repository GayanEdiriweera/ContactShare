export function buildVCard(firstname, surname, phones, emails, links) {
  let vcard = `\
BEGIN:VCARD
VERSION:3.0
PRODID:https://pass.contact
N:${surname ?? ""};${firstname ?? ""};;;
FN:${firstname} ${surname}\n`;

  for (const { type, parameter } of phones) {
    vcard += buildVCardLine("TEL", [type, "VOICE"], parameter);
  }

  for (const { type, parameter } of emails) {
    vcard += buildVCardLine("EMAIL", ["INTERNET", type], parameter);
  }

  for (let i = 0; i < links.length; i++) {
    const { type, parameter } = links[i];
    const group = `item${i + 1}`;
    vcard += buildVCardLine(`${group}.URL`, [type], parameter);
    if (type) {
      vcard += buildVCardLine(`${group}.X-ABLabel`, [], type);
    }
  }

  vcard += "END:VCARD";
  return vcard;
}

function buildVCardLine(property, types, parameter) {
  if (!parameter) {
    return "";
  }

  let line = `${property}`;
  for (const type of types) {
    line += type ? `;type=${escape(type)}` : "";
  }
  line += ":";
  line += escape(parameter);
  line += "\n";
  return line;
}

function escape(text) {
  // RFC says must not escape any other characters
  return text
    .replaceAll("\\", `\\\\`)
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", `\\;`);
}
