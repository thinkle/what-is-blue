<script lang="ts">
  import ModelTester from "./ModelTester.svelte";

  import {
    normalizedData,
    getNormalizedColorData,
    isBlue,
  } from "../lib/colors";
  import { trainModel } from "../neuralnet/model";
  import ColorGraph from "./ColorGraph.svelte";

  let progressUpdates: Array<{
    epoch: number;
    loss: number;
    accuracy: number;
  }> = [];
  let training = false;

  function displayProgress(epoch: number, logs: tf.Logs) {
    progressUpdates = [
      ...progressUpdates,
      { epoch: epoch + 1, loss: logs.loss, accuracy: logs.acc * 100 },
    ];
  }
  let applyModel: (color: number[]) => number;
  let model: any;
  async function doTrainModel() {
    training = true;
    progressUpdates = []; // Clear any previous progress updates
    let result = await trainModel($normalizedData, displayProgress);
    applyModel = result.applyModel;
    model = result.model;
    training = false;
  }
  let score: number;
  let mode: "test" | "graph" = "graph";
</script>

<div>
  <div class="cols">
    <div class="col">
      <button disabled={training} on:click={doTrainModel}>
        {#if !model}Train that Model!{:else}Train it some more!{/if}
      </button>
      <ul class="progress-updates">
        {#each progressUpdates as { epoch, loss, accuracy }}
          <li>
            <span>Epoch: {epoch}</span>
            <span>Loss: {loss.toFixed(4)}</span>
            <span>Accuracy: {accuracy.toFixed(2)}%</span>
          </li>
        {/each}
      </ul>
    </div>
    <div class="col">
      {#if model}
        <h2>We have a model!</h2>
        <div class="tabs">
          <div on:click={() => (mode = "test")} class:active={mode == "test"}>
            Test it Out!
          </div>
          <div on:click={() => (mode = "graph")} class:active={mode == "graph"}>
            Graph Results
          </div>
        </div>
        <div class="body">
          {#if mode == "test"}
            <ModelTester {applyModel} />
          {:else}
            <ColorGraph {applyModel} />
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

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
    display: flex;
    flex-direction: column-reverse;
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
