<script lang="ts">
  import { targetName, normalizedData, isTarget } from "./stores";

  import ColorBlock from "./ColorBlock.svelte";
  import { getNormalizedColorData } from "./colors";

  export let applyModel: (color: number[]) => number;

  let score: number;
  let color: string;
  let lastColor: string;

  function testOutModel() {
    console.log("Test on", color);
    let nums = getNormalizedColorData(color);
    console.log("Run that baby!", color, nums);
    score = applyModel(nums);
    console.log("Got score of", score);
    lastColor = color;
  }

  $: if (color != lastColor) {
    score = undefined;
  }
</script>

Pick a color:<input type="color" bind:value={color} />
{#if color}
  <button on:click={testOutModel}>Apply model!</button>
  <ColorBlock {color} />
{/if}
{#if score}
  {@const blue = score >= 0.5}
  <div>
    Model says:
    {#if blue}Yes, it's {$targetName}!{:else}Not {$targetName}{/if}
    <pre>{score.toFixed(4)}</pre>
  </div>
  <div>Was it right? What say you, human :-)</div>
  <div class="cols">
    <button
      style="--button-color:blue;color:white"
      on:click={() => ($isTarget[color] = true)}
    >
      {#if blue}
        Yes, it's
      {:else}
        No, it's actually
      {/if}
      {$targetName}
    </button>
    <br />
    <button
      style="--button-color:red;color:white"
      on:click={() => ($isTarget[color] = false)}
    >
      {#if blue}
        No, it's not
      {:else}
        Yes, it's not
      {/if}
      {$targetName}
    </button>
  </div>
{/if}

<style>
  .cols {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
  .progress-updates {
    margin-top: 10px;
    padding: 0;
    list-style-type: none;
  }
  li {
    display: flex;
    gap: 8px;
  }

  .progress-updates li {
    padding: 10px;
    margin-bottom: 5px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
  }
</style>
