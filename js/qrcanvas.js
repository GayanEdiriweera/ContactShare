class qrcanvas {
  static encodeAndDrawToCanvas(canvas, text, colors) {
    const code = text
      ? qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM)
      : { size: 0 };
    canvas.style.display = code.size ? "block" : "none";
    if (code.size) drawCodeToCanvas(canvas, code, colors);
  }
}

function drawCodeToCanvas(canvas, code, colors) {
  const { dark, light } = colors;
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
