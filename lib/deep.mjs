
import * as fs from 'node:fs';

export class NeuralNetwork {
    constructor(inputNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.outputNodes = outputNodes;
        this.weights = [new Array(inputNodes).fill(0).map(() => Math.random())];
        this.bias = Math.random();
        this.errRate = 1.0;
    }

    forwardPropagate(inputs) {
        const output = inputs.reduce((sum, input, index) => {
            return sum + input * this.weights[0][index];
        }, 0) + this.bias;
        const activatedOutput = this.sigmoid(output);
        return activatedOutput;
    }

    backwardPropagate(inputs, target, learningRate) {
        // Calculate the error
        const output = this.forwardPropagate(inputs);
        const error = target - output;
        // Adjust weights and bias using gradient descent
        for (let i = 0; i < this.weights[0].length; i++) {
            this.weights[0][i] += learningRate * error * inputs[i];
        }
        this.bias += learningRate * error;
        return error;
    }

    train(inputsArray, targetsArray, numEpochs, learningRate) {
        for (let epoch = 0; epoch < numEpochs; epoch++) {
            for (let i = 0; i < inputsArray.length; i++) {
                const inputs = inputsArray[i];
                const target = targetsArray[i];
                // Forward propagation
                const output = this.forwardPropagate(inputs);
                // Backward propagation dan perbarui bobot dan bias
                this.backwardPropagate(inputs, target, learningRate);
            }
        }
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // Method untuk mendapatkan model dalam bentuk objek JSON
    getModel() {
        return JSON.stringify({
            inputNodes: this.inputNodes,
            outputNodes: this.outputNodes,
            weights: this.weights,
            bias: this.bias
        });
    }

    // Method untuk memuat model dari objek JSON
    loadModel(model) {
        const parsedModel = JSON.parse(model);
        this.inputNodes = parsedModel.inputNodes;
        this.outputNodes = parsedModel.outputNodes;
        this.weights = parsedModel.weights;
        this.bias = parsedModel.bias;
    }

    saveModel(outputPath, modelData) {
        fs.writeFileSync(outputPath, modelData, 'utf-8', (err) => {
            if (err) {
                console.error('Gagal menyimpan model:', err);
            } else {
                console.log('Model berhasil disimpan dalam', outputPath);
            }
        });
    }
}