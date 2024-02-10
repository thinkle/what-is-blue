import { derived, get, writable } from "svelte/store";
import type { Readable, Writable } from "svelte/store";
import { getNormalizedColorData } from "./colors";
import type { DataPoint } from "./colors";

/* Our svelte implementation will guarantee that
for every color keyed in isBlue, we have a map to
r,g,b values stores in colorMap */

export const colorMap: { [key: string]: [number, number, number] } = {};

export const resetColorData = () => {
  isTarget.set({});
  let target = get(targetName);
  localStorage.deleteItem("is-" + target);
};

export const isTarget: Writable<{ [key: string]: boolean }> = writable({}); // Create a derived store to hold normalized color data

export const normalizedData: Readable<DataPoint[]> = derived(
  [isTarget], // List of stores to derive from
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
let startTargetName = localStorage.getItem("custom-target-name") || "blue";
export const targetName = writable(startTargetName);
targetName.subscribe(($targetName) => {
  localStorage.setItem("custom-target-name", $targetName);
  loadStoredColorData($targetName);
}); // Load from local storage!

function loadStoredColorData($targetName) {
  let stored = localStorage.getItem("is-" + $targetName);
  if (stored) {
    try {
      let parsed = JSON.parse(stored);
      isTarget.set(parsed);
      console.log("Set is target from memory to ", isTarget);
    } catch (err) {
      console.log("Error in saved data", stored);
    }
  }
}
loadStoredColorData(get(targetName));
isTarget.subscribe(($isTarget) => {
  let $targetName = get(targetName);
  localStorage.setItem("is-" + $targetName, JSON.stringify($isTarget));
});
