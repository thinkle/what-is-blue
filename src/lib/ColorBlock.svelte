<script lang="ts">
  import { colorMap } from "./colors";
  export let color: string;
  let text = "white";
  let r: number;
  let g: number;
  let b: number;
  let el: HTMLDivElement;

  function getReadableTextColor(r: number, g: number, b: number) {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "black" : "white";
  }

  function parseColor() {
    if (colorMap[color]) {
      const [r, g, b] = colorMap[color];
      return { r, g, b };
    }
    const computedColor = window.getComputedStyle(el).backgroundColor;
    const colorMatch = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (colorMatch) {
      const [_, r, g, b] = colorMatch;
      colorMap[color] = [Number(r), Number(g), Number(b)];
      return { r: Number(r), g: Number(g), b: Number(b) };
    }

    throw new Error("Failed to parse color string");
  }
  let e: Error;
  $: if (el) {
    try {
      ({ r, g, b } = parseColor());
    } catch (err) {
      let e = err;
    }
  }

  $: textcolor = getReadableTextColor(r, g, b);
</script>

<div
  style:--color={color}
  style:--text={textcolor}
  class="color"
  bind:this={el}
>
  {#if r !== undefined}<span class="rgb">
      {r},{g},{b}
    </span>{/if}
  {#if e}
    Error?
    {console.log("Hit error parsing", e)}
  {/if}
  <span class="string">{color}</span>
</div>

<style>
  div {
    background-color: var(--color);
    display: grid;
    place-content: center;
    width: 100px;
    height: 100px;
    margin: 8px;
    border-radius: 16px;
    font-size: 14px;
    text-align: center;
    font-weight: bold;
    color: var(--text);
  }
  .rgb {
    font-weight: 900;
  }
  .string {
    font-weight: 200;
  }
</style>
