<script lang="ts">
  import ColorBlock from "./ColorBlock.svelte";
  import { crossfade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { flip } from "svelte/animate";
  import { isBlue } from "./colors";

  const [send, receive] = crossfade({ duration: 300 });

  let categorized: string[] = [];
  $: {
    categorized = Object.keys($isBlue);
    categorized.reverse();
  }

  function newColor() {
    let c;
    do {
      const r = Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
      const g = Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
      const b = Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
      c = `#${r}${g}${b}`;
    } while ($isBlue.hasOwnProperty(c));
    theColor = c;
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
</script>

<section class="categorizer">
  <header>
    <div class="ctr">
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
    <div class="col notblue">
      <h2>Not Blue</h2>
      <ul>
        {#each categorized.filter((c) => !$isBlue[c]) as color (color)}
          <li
            animate:flip
            in:receive={{ key: color }}
            out:send={{ key: color }}
            on:click={() => ($isBlue[color] = true)}
          >
            <ColorBlock {color} />
          </li>
        {/each}
      </ul>
    </div>
    <div class="divider" />
    <div class="col blue">
      <h2>Blue</h2>
      <ul>
        {#each categorized.filter((c) => $isBlue[c]) as color (color)}
          <li
            animate:flip
            in:receive={{ key: color }}
            out:send={{ key: color }}
            on:click={() => ($isBlue[color] = false)}
          >
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
    max-width: 400px;
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
</style>
