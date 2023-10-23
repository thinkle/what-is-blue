<script lang="ts">
  import Trainer from "./lib/Trainer.svelte";

  import Categorizer from "./lib/Categorizer.svelte";
  import { normalizedData } from "./lib/colors";
  //import ColorBlock from "./lib/ColorBlock.svelte";
  let showTrainer = false;
</script>

<main>
  <div>
    <h1>What is Blue?</h1>
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
</style>
