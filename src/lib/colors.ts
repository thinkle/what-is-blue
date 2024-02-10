import convert from "color-convert";
import { colorMap } from "./stores";

// Define a type for a single data point
export type DataPoint = {
  color: [number, number, number];
  isBlue: boolean;
};

export function getNormalizedColorData(colorString: string) {
  if (colorMap[colorString]) {
    const [r, g, b] = colorMap[colorString];
    return [r, g, b];
  } else if (/^#[0-9a-fA-F]{6}$/.test(colorString)) {
    // Parse the hex string into RGB values
    const r = parseInt(colorString.slice(1, 3), 16);
    const g = parseInt(colorString.slice(3, 5), 16);
    const b = parseInt(colorString.slice(5, 7), 16);
    colorMap[colorString] = [r, g, b];
    return [r, g, b];
  } else {
    // Create an off-screen element to get the color from the browser
    const tempElem = document.createElement("div");
    tempElem.style.display = "none";
    tempElem.style.backgroundColor = colorString;
    document.body.appendChild(tempElem);

    // Get the computed style
    const computedStyle = getComputedStyle(tempElem);
    const rgbString = computedStyle.backgroundColor;

    // Parse the RGB string into values
    const rgbMatch = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    document.body.removeChild(tempElem);

    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number);
      colorMap[colorString] = [r, g, b];
      return [r, g, b];
    } else {
      console.log("WARNING: BAD COLOR?", colorString);
      return [0, 0, 0];
    }
  }
}

export function getHue(c: string) {
  let [r, g, b] = getNormalizedColorData(c);
  let [h, s, l] = convert.rgb.hsl(r, g, b);
  return h;
}

export function compareHue(a: string, b: string) {
  let rgb1 = getNormalizedColorData(a);
  let rgb2 = getNormalizedColorData(b);
  let hsl1 = convert.rgb.hsl(...rgb1);
  let hsl2 = convert.rgb.hsl(...rgb2);
  return hsl2[0] - hsl1[0];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}
