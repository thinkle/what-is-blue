<script lang="ts">
  let showEditor = true;
  export let modelLayers: number[] = [16]; // Default to one hidden layer with 16 neurons.
  export let onChange: any;

  function addLayer() {
    modelLayers = [...modelLayers, 16]; // Adds a new layer with 16 neurons by default.
    onChange(modelLayers); // Notify parent component of the change.
  }

  function fireUpdate() {
    onChange(modelLayers); // Notify parent component of the change.
  }

  function removeLayer(index: number) {
    modelLayers = modelLayers.filter((_, i) => i !== index);
    onChange(modelLayers); // Notify parent component of the change.
  }

  let canvas: HTMLCanvasElement;

  function drawDiagram(layers: number[], canvas: HTMLCanvasElement) {
    if (!canvas) return;
    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    let w = canvas.width;
    let h = canvas.height;
    let r = 8;
    let padding = 15;
    ctx.clearRect(0, 0, w, h); // Clear any previous drawings
    let nlayers = layers.length + 2;
    let maxnodes = Math.max(...layers, 3, 1);
    // Calculate distance between layers
    let xdelta = (w - padding * 2) / nlayers;
    // Calculate distance between nodes
    let ydelta = (h - padding * 2) / maxnodes;
    let cy = h / 2;
    // Ok, now draw each layer...
    let xindex = 0;
    let lastIndices: [number, number][] = [];
    for (let layer of [3, ...layers, 1]) {
      let indices: [number, number][] = [];
      let x = padding + xindex * xdelta;
      let ytop = cy - (layer * ydelta) / 2;
      for (let i = 0; i < layer; i++) {
        let y = ytop + ydelta * i;
        indices.push([x, y]);
        // Draw connecting lines...
        for (let [ox, oy] of lastIndices) {
          ctx.strokeStyle = "#aaa";
          ctx.moveTo(ox, oy);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        // draw circle
        ctx.strokeStyle = "#aaa";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (xindex == 0) {
          ctx.fillStyle = {
            0: "red",
            1: "green",
            2: "blue",
          }[i] as "red" | "green" | "blue";
        } else if (xindex == nlayers - 1) {
          ctx.fillStyle = "white";
          ctx.strokeStyle = "blue";
        } else {
          ctx.fillStyle = "grey";
        }
        ctx.stroke();
        ctx.fill();
      }
      ctx.strokeStyle = "#999"; // light grey lines...
      lastIndices = indices;
      xindex++;
    }
  }
  $: drawDiagram(modelLayers, canvas);
</script>

<div style="margin-top:32px;position: relative">
  {#if showEditor}
    <button class="corner small" on:click={() => (showEditor = false)}>-</button
    >
    <div>Neuron layers</div>
    <div class="layers">
      {#each modelLayers as neurons, index}
        <div class="layer">
          <input
            type="number"
            min="1"
            on:change={fireUpdate}
            bind:value={neurons}
          />
          {#if modelLayers.length > 1}
            <button class="small delete" on:click={() => removeLayer(index)}
              >&times;</button
            >
          {/if}
        </div>
      {/each}
      <button on:click={addLayer}>+</button>
    </div>
  {/if}
  <div class="diagram">
    <button class="edit corner small" on:click={() => (showEditor = true)}>
      ✏️
    </button>
    <!-- Visualization of the neural network -->
    <!-- This is a simplistic representation and can be improved with SVG or a graphics library -->
    <canvas width="800" height="400" bind:this={canvas} />
  </div>
</div>

<style>
  canvas {
    width: 400px;
    height: 200px;
  }
  .diagram {
    position: relative;
  }
  .corner {
    position: absolute;
    right: 8px;
    top: 8px;
  }
  input {
    width: 3em;
  }
  .layers {
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .layer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .diagram {
    display: flex;
  }
  .input-layer,
  .hidden-layer,
  .output-layer {
    border: 1px solid #ccc;
    padding: 10px;
    margin: 5px;
  }
  .small {
    padding: 4px;
    border-radius: 50%;
    width: 1.3em;
    height: 1.3em;
    background-color: white;
  }
</style>
