<script lang="ts">
  import ModelTester from "./ModelTester.svelte";
  import {
    normalizedData,
    getNormalizedColorData,
    isBlue,
  } from "../lib/colors";
  import { ColorModel } from "../neuralnet/model";
  import ColorGraph from "./ColorGraph.svelte";
  import ModelSettings from "./ModelSettings.svelte";
  let weights: number[][][] | null = null;
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
  let trainedLayers: string = "";
  async function doTrainModel() {
    training = true;
    progressUpdates = []; // Clear any previous progress updates
    if (modelLayers) {
      if (JSON.stringify(modelLayers) != trainedLayers) {
        model = null;
      }
    }
    let cm = model || new ColorModel(modelLayers);
    await cm.train($normalizedData, displayProgress);
    applyModel = (v) => model.apply(v);
    model = cm;
    trainedLayers = JSON.stringify(modelLayers);
    weights = cm.getWeights();
    console.log("Got weights", weights);
    training = false;
  }
  let score: number;
  let mode: "test" | "graph" = "graph";
  let modelLayers = [16];
</script>

<div>
  <div class="cols">
    <div class="col">
      <button disabled={training} on:click={doTrainModel}>
        {#if !model}Train that Model!{:else}Train it some more!{/if}
      </button>
      <ModelSettings
        {weights}
        {modelLayers}
        onChange={(v) => {
          modelLayers = v;
          weights = null;
        }}
      />
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
