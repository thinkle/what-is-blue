<script lang="ts">
  import ColorBlock from "./ColorBlock.svelte";
  import { normalizedData, type DataPoint, isBlue, rgbToHex } from "./colors";
  import convert from "color-convert";
  export let datum: DataPoint;
  export let v: Number;
  export let correct: boolean;
  export let incorrect: boolean;
  let blue: boolean;

  function updateBlueFromDatum(d: DataPoint) {
    blue = d.isBlue;
  }
  $: updateBlueFromDatum(datum);
  $: correct = blue === v > 0.5;
  $: incorrect = !correct;
  type Mode =
    | "Human Value"
    | "Hue"
    | "Saturation"
    | "Luminance"
    | "Custom Formula";

  export let mode: Mode;
  export let y;

  let customFormula = "b-(r+g)"; // Placeholder formula
  let yValue;

  let active = false;

  function changeColorValue() {
    blue = !blue;
    let hex = rgbToHex(...datum.color);
    $isBlue[hex] = blue;
    datum.isBlue = blue;
    console.log("Set value for", hex, "to ", blue);
  }
</script>

<div class="control" class:active on:click={() => (active = !active)} />
<article class:correct class:incorrect class:blue class:notblue={blue}>
  <button class="close" on:click={() => (active = false)}>&times;</button>
  <section>
    Model says: {(v > 0.5 && "blue") || "not blue"} ({v?.toFixed(2)})
  </section>
  <section>
    You say:
    {#if blue}Blue
    {:else}Not Blue{/if}
    <button on:click={() => changeColorValue()}>
      Change to {#if blue}Not Blue
      {:else}Blue{/if}
    </button>

    <section>
      Calculated {mode}: {y}
    </section>
    <ColorBlock color={rgbToHex(...datum.color)} />
  </section>
</article>

<style>
  .control {
    width: 100%;
    height: 100%;
  }
  .incorrect {
    border: 2px solid red;
  }
  .incorrect.blue {
    border: 2px solid blue;
  }
  article {
    display: none;
  }

  div.active + article {
    padding: 16px;
    position: relative;
    z-index: 3;
    width: 200px;
    margin-left: -100px;
    margin-top: 16px;
    gap: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background-color: #fffc;
  }
  .close {
    padding: 0;
    background-color: transparent;
    border: none;
    right: 3px;
    top: 3px;
    position: absolute;
    width: 1em;
    height: 1em;
  }
</style>
