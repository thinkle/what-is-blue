<script lang="ts">
  import Trainer from "./lib/Trainer.svelte";

  import Categorizer from "./lib/Categorizer.svelte";

  import { targetName } from "./lib/stores";

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
      <div class="flex">
        <input id="target" type="entry" bind:value={$targetName} />
        <button on:click={() => (customizeTarget = false)}>&times;</button>
      </div>
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
  .flex {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
  .flex input,
  .flex button {
    height: 32px;
  }
</style>
