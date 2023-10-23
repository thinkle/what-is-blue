import { derived, writable } from "svelte/store";
import type { Readable, Writable } from "svelte/store";

/* Our svelte implementation will guarantee that 
for every color keyed in isBlue, we have a map to
r,g,b values stores in colorMap */
export const colorMap: { [key: string]: [number, number, number] } = {};

export const isBlue: Writable<{ [key: string]: boolean }> = writable({});

// Define a type for a single data point
export type DataPoint = {
  color: [number, number, number];
  isBlue: boolean;
};

// Load from local storage!
let stored = localStorage.getItem("is-blue");
if (stored) {
  try {
    let parsed = JSON.parse(stored);
    isBlue.set(parsed);
    console.log("Set is blue from memory to ", isBlue);
  } catch (err) {
    console.log("Error in saved data", stored);
  }
}

isBlue.subscribe(($isBlue) =>
  localStorage.setItem("is-blue", JSON.stringify($isBlue))
);
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
      throw new Error("Unable to parse color");
    }
  }
}

// Create a derived store to hold normalized color data
export const normalizedData: Readable<DataPoint[]> = derived(
  [isBlue], // List of stores to derive from
  ([$isBlue], set) => {
    // Convert the data in colorMap and isBlue to a normalized form
    const data: DataPoint[] = Object.keys($isBlue).map((key) => {
      return {
        color: getNormalizedColorData(key),
        isBlue: $isBlue[key],
      };
    });

    // Set the value of the derived store
    set(data);
  }
);
