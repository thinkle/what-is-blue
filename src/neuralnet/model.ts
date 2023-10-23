import * as tf from "@tensorflow/tfjs";
import type { DataPoint } from "../lib/colors";

class ColorModel {
  private model: tf.Sequential;
  private totalEpochs: number;
  constructor(layerNeurons: number[] = [16]) {
    // Default to one hidden layer with 16 neurons
    this.model = tf.sequential();
    this.initializeModel(layerNeurons);
  }

  private initializeModel(layerNeurons: number[]) {
    console.log("Initialize model with ", layerNeurons);
    this.totalEpochs = 0;
    // Input Layer: It's crucial to define the input shape for the first layer.
    this.model.add(
      tf.layers.dense({
        units: layerNeurons[0],
        activation: "relu",
        inputShape: [3],
      })
    );

    // Hidden Layers: Add additional layers as specified in layerNeurons array.
    for (let i = 1; i < layerNeurons.length; i++) {
      this.model.add(
        tf.layers.dense({ units: layerNeurons[i], activation: "relu" })
      );
      console.log("Adding layer of ", layerNeurons[i], "neurons");
    }

    // Output Layer: Sigmoid activation function for binary classification.
    this.model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

    this.model.compile({
      optimizer: tf.train.adam(),
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });
  }

  async train(
    data: DataPoint[],
    displayProgress: (epoch: number, logs: tf.Logs) => void
  ) {
    const colors = data.map((d) => d.color);
    const labels = data.map((d) => (d.isBlue ? 1 : 0));

    const colorTensor = tf.tensor2d(colors);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    const customCallback = {
      onEpochEnd: async (epoch, logs) => {
        this.totalEpochs++;
        displayProgress(this.totalEpochs, logs);
      },
    };

    await this.model.fit(colorTensor, labelTensor, {
      epochs: 10,
      shuffle: true,
      callbacks: [customCallback],
    });
  }

  apply(color: [number, number, number]): number {
    const colorTensor = tf.tensor2d([color]);
    const prediction = this.model.predict(colorTensor) as tf.Tensor;
    const score = prediction.dataSync()[0];
    prediction.dispose();
    return score;
  }

  // Additional methods like save() and load() could be added here in the future.
}

// Export an instance of ColorModel or the class itself based on your use case.
export const colorModel = new ColorModel();
// or
export { ColorModel };
