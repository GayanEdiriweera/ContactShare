class qrcanvas {
  static encodeAndDrawToCanvas(canvas, text, colors, resolution = 400) {
    const code = text
      ? qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM)
      : { size: 0 };
    canvas.style.display = code.size ? "block" : "none";
    if (code.size) drawCodeToCanvas(canvas, code, colors, resolution);
  }
}

function drawCodeToCanvas(canvas, code, colors, resolution) {
  const { dark, light } = colors;
  const context = canvas.getContext("2d");
  const codeSizeWithBorder = code.size + 4;
  const cellSizePixels = resolution / codeSizeWithBorder;
  canvas.width = resolution;
  canvas.height = resolution;
  context.fillStyle = light;
  context.fillRect(0, 0, resolution, resolution);

  for (let y = 0; y < codeSizeWithBorder; y++) {
    for (let x = 0; x < codeSizeWithBorder; x++) {
      context.fillStyle = getFillStyle(
        x,
        y,
        codeSizeWithBorder,
        code,
        dark,
        light
      );
      context.fillRect(
        x * cellSizePixels - 1,
        y * cellSizePixels - 1,
        cellSizePixels + 1,
        cellSizePixels + 1
      );
    }
  }
}

function getFillStyle(x, y, codeSizeWithBorder, code, dark, light) {
  const isOuterOutline =
    x == 0 ||
    y == 0 ||
    x == codeSizeWithBorder - 1 ||
    y == codeSizeWithBorder - 1;
  const isInnerOutline =
    x == 1 ||
    y == 1 ||
    x == codeSizeWithBorder - 2 ||
    y == codeSizeWithBorder - 2;
  if (isOuterOutline) return dark;
  if (isInnerOutline) return light;
  return code.modules[y - 2][x - 2] ? dark : light;
}

