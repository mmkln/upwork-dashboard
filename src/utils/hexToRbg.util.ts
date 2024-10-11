export const hexToRgb = (hex: string) => {
  let sanitizedHex = hex.replace("#", "");
  if (sanitizedHex.length === 3) {
    sanitizedHex = sanitizedHex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const bigint = parseInt(sanitizedHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};
