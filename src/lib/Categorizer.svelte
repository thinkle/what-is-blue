<script lang="ts">
  import ColorBlock from "./ColorBlock.svelte";
  import { crossfade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { flip } from "svelte/animate";
  import { compareHue, getHue } from "./colors";
  import { isTarget, targetName } from "./stores";

  import convert from "color-convert";

  const [send, receive] = crossfade({ duration: 300 });
  let customTarget = "#2a3aef";
  let newColorMode:
    | "default"
    | "blueish"
    | "blues"
    | "warm"
    | "cool"
    | "green"
    | "custom" = "default";
  let sortMode: "default" | "hue" = "default";

  let categorized: string[] = [];
  $: {
    categorized = Object.keys($isTarget);
    categorized.reverse();
  }

  function newColor() {
    let giveUpAfter = 1000;
    let count = 0;
    let c;
    do {
      count++;
      let [r, g, b] = generateColor();
      r = r.toString(16).padStart(2, "0");
      g = g.toString(16).padStart(2, "0");
      b = b.toString(16).padStart(2, "0");
      c = `#${r}${g}${b}`;
    } while (count < giveUpAfter && $isTarget.hasOwnProperty(c));
    theColor = c;

    function generateColor() {
      if (newColorMode == "default") {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return [r, g, b];
      } else if (newColorMode == "custom") {
        let [r, g, b] = convert.hex.rgb(customTarget);
        const [h, s, l] = convert.rgb.hsl(r, g, b);
        // Generate random numbers for H, S, and L within the range of -15 to 15
        let randomH = Math.random() * 30 - 15;
        let randomS = Math.random() * 30 - 15;
        let randomL = Math.random() * 30 - 15;

        // Clamp the new H, S, and L values within their respective ranges
        let h2 = (h + randomH + 360) % 360; // Hue is a circular value, so we wrap around using modulo 360
        let s2 = Math.max(0, Math.min(100, s + randomS)); // Saturation must be between 0 and 100
        let l2 = Math.max(0, Math.min(100, l + randomL)); // Lightness must be between 0 and 100

        return convert.hsl.rgb(h2, s2, l2);
      } else {
        // blues
        let minHue = 179;
        let maxHue = 249;
        if (newColorMode == "blueish") {
          minHue = 173;
          maxHue = 295;
        }
        if (newColorMode == "warm") {
          minHue = -30;
          maxHue = 69;
        } else if (newColorMode == "cool") {
          minHue = 158;
          maxHue = 290;
        } else if (newColorMode == "green") {
          minHue = 70;
          maxHue = 170;
        }
        let h = Math.round(minHue + Math.random() * (maxHue - minHue));
        if (h < 0) {
          h = 360 - h;
        }
        let s = Math.random() * 100;
        let l = Math.random() * 100;
        return convert.hsl.rgb(h, s, l);
      }
    }
  }
  let theColor = "red";
  newColor();

  function markBlue(c: string) {
    $isTarget[c] = true;
    newColor();
  }
  function markNotBlue(c: string) {
    $isTarget[c] = false;
    newColor();
  }
  let blueColors: [];
  let notBlueColors: [];

  function sortColors(categorized: string[], sortMode: "default" | "hue") {
    blueColors = categorized.filter((c) => $isTarget[c]);
    notBlueColors = categorized.filter((c) => !$isTarget[c]);
    if (sortMode == "hue") {
      blueColors.sort(compareHue);
      notBlueColors.sort(compareHue);
    }
  }
  let numberToAnimate = 20;
  $: sortColors(categorized, sortMode);
</script>

<section class="categorizer">
  <header class="rel">
    <div class="corner">
      <select class="" bind:value={newColorMode}>
        <option value="default">Random!</option>
        <option value="blueish">Teal/Blue/Purple Hues</option>
        <option value="blues">Blue Hues</option>
        <option value="warm">Warm Hues</option>
        <option value="cool">Cool Hues</option>
        <option value="green">Green Hues</option>
        <option value="custom">Custom Target</option>
      </select>
      {#if newColorMode == "custom"}
        <br /><label
          >Colors near: <input bind:value={customTarget} type="color" /></label
        >
      {/if}
    </div>
    <div class="ctr gradient">
      {#each [theColor] as c (c)}
        <div class="theColor" out:send={{ key: c }}>
          <ColorBlock color={c} />
        </div>
      {/each}
    </div>
    <div class="cols">
      <button
        style="--button-color: red;color:white;"
        on:click={() => markNotBlue(theColor)}>Not {$targetName}?</button
      >
      <button
        style="--button-color: blue;color:white;"
        on:click={() => markBlue(theColor)}>{$targetName}!</button
      >
    </div>
  </header>
  <div class="cols rel">
    <select class="corner" bind:value={sortMode}>
      <option value="default">As categorized</option>
      <option value="hue">By Hue</option>
    </select>

    <div class="col notblue">
      <h2>
        Not {$targetName}
        <div class="small">({notBlueColors.length})</div>
      </h2>

      <ul>
        {#each notBlueColors.slice(0, numberToAnimate) as color (color)}
          <li
            animate:flip
            in:receive={{ key: color }}
            out:send={{ key: color }}
            on:click={() => ($isTarget[color] = true)}
          >
            <ColorBlock {color} />
          </li>
        {/each}
        <!-- No animatons after the first few for performance... -->
        {#each notBlueColors.slice(numberToAnimate) as color (color)}
          <li on:click={() => ($isTarget[color] = true)}>
            <ColorBlock {color} />
          </li>
        {/each}
      </ul>
    </div>
    <div class="divider" />
    <div class="col blue">
      <h2>
        {$targetName}
        <div class="small">({blueColors.length})</div>
      </h2>

      <ul>
        {#each blueColors.slice(0, numberToAnimate) as color (color)}
          <li
            animate:flip
            in:receive={{ key: color }}
            out:send={{ key: color }}
            on:click={() => ($isTarget[color] = false)}
          >
            <ColorBlock {color} />
          </li>
        {/each}
        {#each blueColors.slice(numberToAnimate) as color (color)}
          <!-- No animatons after the first few for performance... -->
          <li on:click={() => ($isTarget[color] = false)}>
            <ColorBlock {color} />
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<style>
  section {
    --head-height: 64px;
  }
  .col {
    width: 40vw;
  }
  h2 {
    text-align: center;
  }
  ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  li {
    display: block;
  }
  .ctr {
    display: flex;
    justify-content: center;
  }
  .cols {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: start;
  }
  h2 {
    height: var(--head-height);
  }
  .divider {
    margin-top: var(--head-height);
    width: 3px;
    min-height: 300px;
    background-color: #333;
  }
  .theColor {
    animation: pop-in 300ms;
    animation-delay: 200ms;
    animation-fill-mode: backwards;
  }
  @keyframes pop-in {
    0% {
      transform: scale(0);
      transform-origin: center;
      opacity: 0;
    }
    90% {
      transform: scale(1.1) rotate(5deg);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }
  h2 {
    margin-bottom: 0;
  }
  .small {
    text-align: center;
    font-size: small;
    font-weight: normal;
  }
  .gradient {
    background: linear-gradient(to bottom, black 0%, white 100%);
  }
  .corner {
    position: absolute;
    right: 8px;
    top: 8px;
  }
  .rel {
    position: relative;
  }
  button {
    text-transform: capitalize;
  }
  h2 {
    text-transform: capitalize;
  }
</style>
