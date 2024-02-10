<script lang="ts">
  import ColorBlock from "./ColorBlock.svelte";
  import GraphPoint from "./GraphPoint.svelte";

  import { targetName, normalizedData } from "./stores";
  import type { DataPoint } from "./colors";
  import { rgbToHex } from "./colors";
  import convert from "color-convert";
  export let applyModel: (color: number[]) => number;

  type Mode =
    | "Human Value"
    | "Hue"
    | "Saturation"
    | "Luminance"
    | "Custom Formula";
  let selectedOption: Mode = "Hue"; // Default option
  let customFormula = "b-(r+g)"; // Placeholder formula
  let yValue;

  function getYLabel(perc: number, mode: Mode) {
    /* Get label for value of 0, 0.5 or 1 */
    if (mode == "Hue") {
      let number = perc * 360;
      if (number < 10 || number > 360) {
        return "Red";
      } else if (number > 50 && number < 70) {
        return "Yellow";
      } else if (number > 170 && number < 190) {
        return "Cyan";
      } else if (number > 230 && number < 250) {
        return "Blue";
      } else if (number > 290 && number < 310) {
        return "Magenta";
      }
    }
    if (mode == "Human Value") {
      if (perc == 1) {
        return $targetName;
      } else if (perc == 0) {
        return `Not ${$targetName}`;
      } else {
        return "";
      }
    }
    return perc * 100 + "%";
  }

  function computeYPercent(color: number[], mode: Mode, customFormula: any) {
    /* Get our position on the scale from 0-100 */
    let v = computeYValue(color, mode, customFormula);
    let scale = {
      "Human Value": 360,
      Hue: 360,
      Saturation: 100,
      Luminance: 100,
      "Custom Formula": 100,
    }[mode];
    let yp = 100 * (v / scale);
    return yp;
  }

  function computeYValue(color: number[], mode: Mode, customFormula: any) {
    /* Beginning with r,g,b as three integers 0-255*/
    /* Fix me!!! */
    if (mode == "Human Value") {
      if ($normalizedData.find((dp) => dp.color == color)?.isBlue) {
        return 10 * Math.random() + 90;
      } else {
        return 10 * Math.random();
      }
    }
    const [r, g, b] = color;
    const [h, s, l] = convert.rgb.hsl(r, g, b);
    if (selectedOption === "Custom Formula") {
      // Evaluate custom formula
      let yValue = 50;
      try {
        const calc = new Function(
          "r",
          "g",
          "b",
          "h",
          "s",
          "l",
          `{return ${customFormula}}`
        );
        yValue = calc(r, g, b, h, s, l);
        console.log("Successfully calculated", yValue, "with", calc);
        if (isNaN(yValue)) {
          console.log("NaN", yValue);
          yValue = 50;
        }
      } catch (err) {
        console.log(
          "error with custom formula",
          err,
          `function calc (r,g,b,h,s,l) {return ${customFormula}}`
        );
      }
      return yValue;
    } else {
      // Compute yValue based on selected option
      switch (selectedOption) {
        case "Hue":
          yValue = h;
          break;
        case "Saturation":
          yValue = s;
          break;
        case "Luminance":
          yValue = l;
          break;
        default:
          yValue = h; // default to hue
      }
      return yValue;
    }
  }
</script>

<section>
  We have {$normalizedData.length} data points.
</section>
<!-- Dropdown for selecting Y-axis representation -->
<section class="row">
  Y-Axis:
  <select bind:value={selectedOption}>
    <option>Human Value</option>
    <option>Hue</option>
    <option>Saturation</option>
    <option>Luminance</option>
    <option>Custom Formula</option>
  </select>
  {#if selectedOption === "Custom Formula"}
    (r,g,b,h,s,l)=><input
      type="text"
      bind:value={customFormula}
      placeholder="b-(r+g)"
    />
  {/if}
</section>
<!-- Input for custom formula -->

<section class="graph">
  <section class="vertical legend">
    <div class="label" style="bottom:0%">{getYLabel(0, selectedOption)}</div>
    <div class="label" style="bottom:25%">
      {getYLabel(0.25, selectedOption)}
    </div>
    <div class="label" style="bottom:50%">{getYLabel(0.5, selectedOption)}</div>
    <div class="label" style="bottom:75%">
      {getYLabel(0.75, selectedOption)}
    </div>
    <div class="label" style="bottom:100%">{getYLabel(1, selectedOption)}</div>
  </section>
  <section class="horizontal legend">
    <div class="label" style="left:0%">0</div>
    <div class="label" style="left:50%">0.5</div>
    <div class="label" style="left:100%">1.0</div>
  </section>
  <section class="divider">
    <section class="not-blue">Not {$targetName}</section>
    <section class="blue">{$targetName}</section>
  </section>
  <section class="data">
    {#each $normalizedData as datum}
      {@const v = applyModel(datum.color)}
      {@const correct = v >= 0.5 == datum.isBlue}
      {@const incorrect = !correct}
      <div
        class:incorrect
        class:correct
        class:blue={datum.isBlue}
        style:background-color={`rgb(${datum.color.join(",")})`}
        style:bottom={`${computeYPercent(
          datum.color,
          selectedOption,
          customFormula
        )}%`}
        style:left={`${100 * v}%`}
        data-model-value={v?.toFixed(3)}
        data-y-value={computeYValue(
          datum.color,
          selectedOption,
          customFormula
        )?.toFixed(3)}
      >
        <GraphPoint
          {datum}
          {v}
          mode={selectedOption}
          y={computeYValue(datum.color, selectedOption, customFormula)}
        />
      </div>
    {/each}
  </section>
</section>
<div class="cols">
  <div class="col">
    <h3>Colors</h3>
    {#each $normalizedData as datum}
      <div>{rgbToHex(...datum.color)}</div>
    {/each}
  </div>
  <div class="col">
    <h3>Model</h3>
    {#each $normalizedData as datum}
      <div>{applyModel(datum.color).toFixed(2)}</div>
    {/each}
  </div>
  <div class="col">
    <h3>Human</h3>
    {#each $normalizedData as datum}
      <div>{datum.isBlue}</div>
    {/each}
  </div>
</div>

<style>
  .cols,
  .cols div {
    position: static;
    width: inherit;
    height: inherit;
  }
  .cols {
    display: flex;
    flex-direction: row;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .label {
    width: 3em;
    margin-left: -1.5em;
    text-align: center;
  }
  /* div:hover::after {
    content: attr(data-model-value);
    position: absolute;
    right: 20px;
    display: block;
  }
  div:hover::before {
    content: attr(data-y-value);
    position: absolute;
    top: -20px;
  } */

  .graph {
    --width: 400px;
    width: var(--width);
    min-height: 400px;
    position: relative;
    margin-left: 48px;
    margin-bottom: 48px;
  }
  div {
    box-sizing: border-box;
    position: absolute;
    --r: 18px;
    width: var(--r);
    height: var(--r);
    margin-left: calc(-0.5 * var(--r));
    margin-top: calc(-0.5 * var(--r));
    border-radius: 50%;
  }

  .horizontal.legend div {
    bottom: -24px;
  }
  .vertical.legend div {
    left: -24px;
  }
  .row {
    display: flex;
    align-items: center;
  }
  .divider {
    width: 100%;
    height: 100%;
    display: flex;
  }
  .divider > * {
    display: grid;
    place-content: center;
    width: calc(var(--width) / 2);
    height: 400px;
  }
  section.blue {
    border-left: 5px solid blue;
  }
  .blue,
  .not-blue {
    text-transform: capitalize;
  }
  .incorrect {
    border: 2px solid red;
    z-index: 3;
  }
  .incorrect.blue {
    border: 2px solid blue;
  }
  div article {
    display: none;
  }

  div.active article {
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
