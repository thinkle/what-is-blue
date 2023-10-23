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
    {#if !showTrainer}
      <div>
        Done categorizing? Let's train a model! <button
          on:click={() => (showTrainer = true)}>Let's build a model!</button
        >
      </div>
      <Categorizer />
    {:else}
      <div>
        Back to categorizing? <button on:click={() => (showTrainer = false)}
          >Categorize</button
        >
      </div>
      <Trainer />
    {/if}
  </div>
  {#each $normalizedData as dp}
    <li>
      {dp.color} => {dp.isBlue}
    </li>
  {/each}
</main>

<style>
</style>
