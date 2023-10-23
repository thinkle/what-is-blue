import * as tf from "@tensorflow/tfjs";
import type { DataPoint } from "../lib/colors";

class ColorModel {
  private model: tf.Sequential;

  constructor() {
    this.model = tf.sequential();
    this.initializeModel();
  }

  private initializeModel() {
    this.model.add(
      tf.layers.dense({ units: 16, activation: "relu", inputShape: [3] })
    );
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
        displayProgress(epoch, logs);
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
