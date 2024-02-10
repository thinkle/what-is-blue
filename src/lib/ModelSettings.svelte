<script lang="ts">
  let showEditor = true;
  export let modelLayers: number[] = [16]; // Default to one hidden layer with 16 neurons.
  export let onChange: any;
  export let weights: number[][][] | null = null;
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

  // A function to calculate all neuron colors based on the weights
  function calculateNeuronColors(layers, weights) {
    // Initialize colors for input layer
    let neuronColors = [
      [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
      ], // RGB for input layer
    ];
    if (layers && weights) {
      // Calculate colors for all other layers
      for (let l = 1; l < layers.length; l++) {
        let layerWeights = weights[l - 1]; // Get weights leading into the current layer
        if (!layerWeights) {
          return neuronColors;
        }
        let layerColors = [];

        for (let n = 0; n < layers[l]; n++) {
          // Start with a base color, here it is black
          let color = [0, 0, 0];

          for (let p = 0; p < layerWeights.length; p++) {
            let weight = layerWeights[p][n];
            let inputColor = neuronColors[l - 1][p];
            if (!inputColor) {
              return neuronColors;
            }

            // Combine the input color with the current color based on the weight
            if (weight > 0) {
              for (let c = 0; c < 3; c++) {
                color[c] += Math.abs(weight) * inputColor[c];
              }
            } else {
              // let's use inverses in this case
              for (let c = 0; c < 3; c++) {
                color[c] += Math.abs(weight) * (255 - inputColor[c]);
              }
            }
          }

          // Normalize the color values
          let maxValue = Math.max(...color);
          let scale = 255 / maxValue;
          color = color.map((v) => Math.round(v * scale));
          layerColors.push(color);
        }

        neuronColors.push(layerColors);
      }
    }
    console.log("Based on weights:", weights);
    console.log("Got colors", neuronColors);
    return neuronColors;
  }

  function getStrokeColor(
    color: [number, number, number],
    weight: number | undefined
  ) {
    if (!color) {
      return "#777";
    }
    let colorScale = 1;
    /* if (weight === undefined) {
      colorScale = 1;
    } else if (weight < 0) {
      colorScale = 0.5;
    } */
    if (color && color[0] > 240 && color[1] > 240 && color[2] > 240) {
      color[0] *= 0.7;
      color[1] *= 0.7;
      color[2] *= 0.7;
    }
    /* if (weight < 0) {
      console.log("Returning negative weight color");
      console.log(
        `rgb(${color[0] * colorScale}, ${color[1] * colorScale}, ${
          color[2] * colorScale
        })`
      );
    } */
    return `rgb(${color[0] * colorScale}, ${color[1] * colorScale}, ${
      color[2] * colorScale
    })`;
  }

  function drawDiagram(
    layers: number[],
    canvas: HTMLCanvasElement,
    weights: number[][][] | null = []
  ) {
    console.log("Diagram got weights!", weights);
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
    const allLayers = [3, ...layers, 1];
    // Ok -- let's make an array to keep track of "colors" -- we will begin
    // with our input layer representing R,G,B
    const neuronColors = calculateNeuronColors(allLayers, weights);

    for (let layerIndex = 0; layerIndex < allLayers.length; layerIndex++) {
      // As we iterate through layers, we'll want to color the "incoming" lines
      // based on the previous node (so lines "from" red are red and so on and
      // so forth). Each new node will be colored based on the strength of its
      // input weights.
      let layer = allLayers[layerIndex];
      let incomingColors = neuronColors[layerIndex - 1] || [];
      let indices: [number, number][] = [];
      let x = padding + xindex * xdelta;
      let ytop = cy - (layer * ydelta) / 2;
      for (let i = 0; i < layer; i++) {
        let y = ytop + ydelta * i;
        indices.push([x, y]);
        // Draw connecting lines...
        for (let j = 0; j < lastIndices.length; j++) {
          const [ox, oy] = lastIndices[j];
          const color = incomingColors[j];
          const weight =
            weights &&
            weights[layerIndex - 1] &&
            weights[layerIndex - 1][j] &&
            weights[layerIndex - 1][j][i];
          // change to use index instead of for/of loop
          // Get previous neuron color and use it to color the line...
          ctx.beginPath();
          if (weight) {
            ctx.lineWidth = Math.abs(weight) * 8;
          } else {
            ctx.lineWidth = 1;
          }

          ctx.strokeStyle = getStrokeColor(color, weight);
          ctx.moveTo(ox, oy);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        // draw circle
        ctx.strokeStyle = "#aaa";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        // Use the current neuron color to fill the circle...
        if (neuronColors[layerIndex] && neuronColors[layerIndex][i]) {
          const color = neuronColors[layerIndex][i];
          ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        } else {
          // Fallback color if no weights/colors are provided
          ctx.fillStyle = layerIndex === 0 ? "grey" : "white";
        }
        /* if (xindex == 0) {
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
        } */
        ctx.stroke();
        ctx.fill();
      }
      ctx.strokeStyle = "#999"; // light grey lines...
      lastIndices = indices;
      xindex++;
    }
  }
  $: drawDiagram(modelLayers, canvas, weights);
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
