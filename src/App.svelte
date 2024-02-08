<script lang="ts">
  import Trainer from "./lib/Trainer.svelte";

  import Categorizer from "./lib/Categorizer.svelte";
  import { normalizedData, resetColorData, targetName } from "./lib/colors";
  //import ColorBlock from "./lib/ColorBlock.svelte";
  let showTrainer = false;
  let customizeTarget = false;
  customizeTarget;
</script>

<main>
  <div>
    <h1>
      What is <a href="#target" on:click={() => (customizeTarget = true)}
        >{$targetName}</a
      >?
    </h1>
    {#if customizeTarget}
      <input id="target" type="entry" bind:value={$targetName} />
      <button on:click={() => resetColorData()}>Reset Color Data</button>
      <button on:click={() => (customizeTarget = false)}>&times;</button>
    {/if}
    <div class="tabs">
      <div on:click={() => (showTrainer = false)} class:active={!showTrainer}>
        Categorize
      </div>
      <div on:click={() => (showTrainer = true)} class:active={showTrainer}>
        Train a Model
      </div>
    </div>
    {#if !showTrainer}
      <Categorizer />
    {:else}
      <Trainer />
    {/if}
  </div>
</main>

<style>
  a {
    color: inherit;
  }
</style>
