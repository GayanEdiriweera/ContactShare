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
  canvas.width = code.size;
  canvas.height = code.size;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      context.fillStyle = code.modules[y][x] ? dark : light;
      context.fillRect(x, y, 1, 1);
    }
  }
}
