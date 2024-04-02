class qrcanvas {
  static encodeAndDrawToCanvas(canvas, text, colors, maxResolution = 400) {
    const code = text
      ? qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM)
      : { size: 0 };
    canvas.style.display = code.size ? "block" : "none";
    if (code.size) drawCodeToCanvas(canvas, code, colors, maxResolution);
  }
}

function drawCodeToCanvas(canvas, code, colors, maxResolution) {
  const { dark, light } = colors;
  const context = canvas.getContext("2d");
  const totalSizeInModules = code.size + 4; // Including border
  const cellSizeInPixels = Math.floor(maxResolution / totalSizeInModules);
  const totalSizeInPixels = totalSizeInModules * cellSizeInPixels;

  canvas.width = totalSizeInPixels;
  canvas.height = totalSizeInPixels;
  context.fillStyle = light;
  context.fillRect(0, 0, totalSizeInPixels, totalSizeInPixels);

  for (let y = 0; y < totalSizeInModules; y++) {
    for (let x = 0; x < totalSizeInModules; x++) {
      context.fillStyle = getFillStyle(
        x,
        y,
        totalSizeInModules,
        code,
        dark,
        light
      );
      context.fillRect(
        x * cellSizeInPixels,
        y * cellSizeInPixels,
        cellSizeInPixels,
        cellSizeInPixels
      );
    }
  }
}

function getFillStyle(x, y, totalSizeInModules, code, dark, light) {
  const isOuterOutline =
    x == 0 ||
    y == 0 ||
    x == totalSizeInModules - 1 ||
    y == totalSizeInModules - 1;
  const isInnerOutline =
    x == 1 ||
    y == 1 ||
    x == totalSizeInModules - 2 ||
    y == totalSizeInModules - 2;
  if (isOuterOutline) return dark;
  if (isInnerOutline) return light;
  return code.modules[y - 2][x - 2] ? dark : light;
}

