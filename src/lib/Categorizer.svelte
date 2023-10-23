<script lang="ts">
  import ColorBlock from "./ColorBlock.svelte";
  import { crossfade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { flip } from "svelte/animate";
  import { compareHue, getHue, isBlue } from "./colors";
  import convert from "color-convert";
  import VirtualList from "svelte-virtual-list";

  const [send, receive] = crossfade({ duration: 300 });

  let newColorMode: "default" | "blueish" | "blues" = "default";
  let sortMode: "default" | "hue" = "default";

  let categorized: string[] = [];
  $: {
    categorized = Object.keys($isBlue);
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
    } while (count < giveUpAfter && $isBlue.hasOwnProperty(c));
    theColor = c;

    function generateColor() {
      if (newColorMode == "default") {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return [r, g, b];
      } else {
        let minHue = 179;
        let maxHue = 249;
        if (newColorMode == "blueish") {
          minHue = 173;
          maxHue = 295;
        }
        let h = Math.round(minHue + Math.random() * (maxHue - minHue));
        let s = Math.random() * 100;
        let l = Math.random() * 100;
        return convert.hsl.rgb(h, s, l);
      }
    }
  }
  let theColor = "red";
  newColor();

  function markBlue(c: string) {
    $isBlue[c] = true;
    newColor();
  }
  function markNotBlue(c: string) {
    $isBlue[c] = false;
    newColor();
  }
  let blueColors: [];
  let notBlueColors: [];

  function sortColors(categorized: string[], sortMode: "default" | "hue") {
    blueColors = categorized.filter((c) => $isBlue[c]);
    notBlueColors = categorized.filter((c) => !$isBlue[c]);
    if (sortMode == "hue") {
      blueColors.sort(compareHue);
      notBlueColors.sort(compareHue);
    }
  }
  let numberToAnimate = 20;
  $: sortColors(categorized, sortMode);
</script>

<section class="categorizer">
  <header>
    <select class="corner" bind:value={newColorMode}>
      <option value="default">Random!</option>
      <option value="blueish">Teal/Blue/Purple Hues</option>
      <option value="blues">Blue Hues</option>
    </select>
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
        on:click={() => markNotBlue(theColor)}>Not Blue?</button
      >
      <button
        style="--button-color: blue;color:white;"
        on:click={() => markBlue(theColor)}>Blue!</button
      >
    </div>
  </header>
  <div class="cols">
    <select class="corner" bind:value={sortMode}>
      <option value="default">As categorized</option>
      <option value="hue">By Hue</option>
    </select>

    <div class="col notblue">
      <h2>
        Not Blue
        <div class="small">({notBlueColors.length})</div>
      </h2>

      <ul>
        {#each notBlueColors.slice(0, numberToAnimate) as color (color)}
          <li
            animate:flip
            in:receive={{ key: color }}
            out:send={{ key: color }}
            on:click={() => ($isBlue[color] = true)}
          >
            <ColorBlock {color} />
          </li>
        {/each}
        <!-- No animatons after the first few for performance... -->
        {#each notBlueColors.slice(numberToAnimate) as color (color)}
          <li on:click={() => ($isBlue[color] = true)}>
            <ColorBlock {color} />
          </li>
        {/each}
      </ul>
    </div>
    <div class="divider" />
    <div class="col blue">
      <h2>
        Blue
        <div class="small">({blueColors.length})</div>
      </h2>

      <ul>
        {#each blueColors.slice(0, numberToAnimate) as color (color)}
          <li
            animate:flip
            in:receive={{ key: color }}
            out:send={{ key: color }}
            on:click={() => ($isBlue[color] = false)}
          >
            <ColorBlock {color} />
          </li>
        {/each}
        {#each blueColors.slice(numberToAnimate) as color (color)}
          <!-- No animatons after the first few for performance... -->
          <li on:click={() => ($isBlue[color] = false)}>
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
</style>
