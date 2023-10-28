
import * as fs from 'node:fs';

export class NeuralNetworkV2 {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;

        this.weightsInputToHidden = new Array(hiddenNodes).fill(0).map(() => new Array(inputNodes).fill(0).map(() => Math.random()));
        this.biasHidden = new Array(hiddenNodes).fill(0).map(() => Math.random());

        this.weightsHiddenToOutput = new Array(outputNodes).fill(0).map(() => new Array(hiddenNodes).fill(0).map(() => Math.random()));
        this.biasOutput = new Array(outputNodes).fill(0).map(() => Math.random());
    }

    forwardPropagate(inputs) {
        const hiddenOutputs = [];
        const outputOutputs = [];

        for (let hiddenNode = 0; hiddenNode < this.hiddenNodes; hiddenNode++) {
            const hiddenInput = inputs.reduce((sum, input, index) => {
                return sum + input * this.weightsInputToHidden[hiddenNode][index];
            }, 0) + this.biasHidden[hiddenNode];


                const hiddenOutput = this.sigmoid(this.tanh(hiddenInput));
                hiddenOutputs.push(hiddenOutput);
        }

        for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
            const outputInput = hiddenOutputs.reduce((sum, hiddenOutput, index) => {
                return sum + hiddenOutput * this.weightsHiddenToOutput[outputNode][index];
            }, 0) + this.biasOutput[outputNode];
            const outputOutput = this.sigmoid(outputInput);
            outputOutputs.push(outputOutput);
        }

        return { hiddenOutputs, outputOutputs };
    }

    backwardPropagate(inputs, targets, learningRate) {
        const { hiddenOutputs, outputOutputs } = this.forwardPropagate(inputs);
        const outputErrors = new Array(this.outputNodes).fill(0);
        const hiddenErrors = new Array(this.hiddenNodes).fill(0);

        for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
            const output = outputOutputs[outputNode];
            outputErrors[outputNode] = targets[outputNode] - output;
        }

        for (let hiddenNode = 0; hiddenNode < this.hiddenNodes; hiddenNode++) {
            const hiddenOutput = hiddenOutputs[hiddenNode];
            let hiddenError = 0;
            for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
                hiddenError += outputErrors[outputNode] * this.weightsHiddenToOutput[outputNode][hiddenNode];
            }
            hiddenErrors[hiddenNode] = hiddenOutput * (1 - hiddenOutput) * hiddenError;
        }

        for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
            for (let hiddenNode = 0; hiddenNode < this.hiddenNodes; hiddenNode++) {
                this.weightsHiddenToOutput[outputNode][hiddenNode] += learningRate * outputErrors[outputNode] * hiddenOutputs[hiddenNode];
            }
            this.biasOutput[outputNode] += learningRate * outputErrors[outputNode];
        }

        for (let hiddenNode = 0; hiddenNode < this.hiddenNodes; hiddenNode++) {
            for (let inputNode = 0; inputNode < this.inputNodes; inputNode++) {
                this.weightsInputToHidden[hiddenNode][inputNode] += learningRate * hiddenErrors[hiddenNode] * inputs[inputNode];
            }
            this.biasHidden[hiddenNode] += learningRate * hiddenErrors[hiddenNode];
        }

        return { hiddenErrors, outputErrors };
    }

    crossEntropyLoss(predicted, actual) {
        if (predicted.length !== actual.length) {
            throw new Error("Panjang predicted dan actual harus sama.");
        }

        const n = predicted.length;
        let loss = 0;

        for (let i = 0; i < n; i++) {
            loss -= actual[i] * Math.log(predicted[i] + 1e-15);
        }

        return loss;
    }

    getIndexFromHigherValue(arr) {
        return arr.reduce((maxIndex, nilai, currentIndex) => {
            return nilai > arr[maxIndex] ? currentIndex : maxIndex;
        }, 0);
    }

    countTrueLabel(arr) {
        return arr.reduce((count, nilai) => count + nilai, 0);
    }

    train(inputsArray, targetsArray, numEpochs, learningRate) {
        for (let epoch = 0; epoch < numEpochs; epoch++) {
            let loss = 0;

            for (let i = 0; i < inputsArray.length; i++) {
                const inputs = inputsArray[i];
                const targets = targetsArray[i];

                const { hiddenOutputs, outputOutputs } = this.forwardPropagate(inputs);

                const outputErrors = new Array(this.outputNodes);
                const hiddenErrors = new Array(this.hiddenNodes);

                // Menghitung kesalahan di lapisan keluaran
                for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
                    outputErrors[outputNode] = targets[outputNode] - outputOutputs[outputNode];
                }

                // Menghitung kesalahan di lapisan tersembunyi
                for (let hiddenNode = 0; hiddenNode < this.hiddenNodes; hiddenNode++) {
                    let hiddenError = 0;
                    for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
                        hiddenError += outputErrors[outputNode] * this.weightsHiddenToOutput[outputNode][hiddenNode];
                    }
                    hiddenErrors[hiddenNode] = hiddenOutputs[hiddenNode] * (1 - hiddenOutputs[hiddenNode]) * hiddenError;
                }

                // Memperbarui bobot dan bias di lapisan keluaran
                for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
                    for (let hiddenNode = 0; hiddenNode < this.hiddenNodes; hiddenNode++) {
                        this.weightsHiddenToOutput[outputNode][hiddenNode] += learningRate * outputErrors[outputNode] * hiddenOutputs[hiddenNode];
                    }
                    this.biasOutput[outputNode] += learningRate * outputErrors[outputNode];
                }

                // Memperbarui bobot dan bias di lapisan tersembunyi
                for (let hiddenNode = 0; hiddenNode < this.hiddenNodes; hiddenNode++) {
                    for (let inputNode = 0; inputNode < this.inputNodes; inputNode++) {
                        this.weightsInputToHidden[hiddenNode][inputNode] += learningRate * hiddenErrors[hiddenNode] * inputs[inputNode];
                    }
                    this.biasHidden[hiddenNode] += learningRate * hiddenErrors[hiddenNode];
                }

                loss = this.crossEntropyLoss(outputOutputs, targets);
            }

            console.log("Epoch: ", epoch + 1, " Loss: ", loss);
        }
    }

    test(inputFeatureArray, actualTargetArray) {
        const scoreArray = new Array(inputFeatureArray.length).fill(0).map(() => 0);
        let correctPredictions = 0;

        for (let i = 0; i < inputFeatureArray.length; i++) {
            const inputs = inputFeatureArray[i];
            const targets = actualTargetArray[i];

            const { _, outputOutputs } = this.forwardPropagate(inputs); // Gunakan underscore (_) untuk mengabaikan output lapisan tersembunyi.

            const predicted = outputOutputs;
            const predictedIndex = this.getIndexFromHigherValue(predicted);
            const targetIndex = this.getIndexFromHigherValue(targets);

            console.log("Predicted: ", predictedIndex, " Actual: ", targetIndex);

            if (predictedIndex === targetIndex) {
                correctPredictions++;
            }
        }

        const finalScore = correctPredictions / inputFeatureArray.length;
        return finalScore;
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    softmax(arr) {
        const expArr = arr.map(Math.exp);
        const sumExp = expArr.reduce((sum, val) => sum + val, 0);
        return expArr.map((val) => val / sumExp);
    }

    relu(x) {
        return Math.max(0, x);
    }

    leakyRelu(x) {
        return Math.max(0.1 * x, x);
    }

    tanh(x) {
        return Math.tanh(x);
    }

    getModel() {
        return JSON.stringify({
            inputNodes: this.inputNodes,
            hiddenNodes: this.hiddenNodes,
            outputNodes: this.outputNodes,
            weightsInputToHidden: this.weightsInputToHidden,
            biasHidden: this.biasHidden,
            weightsHiddenToOutput: this.weightsHiddenToOutput,
            biasOutput: this.biasOutput
        });
    }

    loadModel(model) {
        const dataModel = fs.readFileSync(model, 'utf-8');
        const parsedModel = JSON.parse(dataModel);
        this.inputNodes = parsedModel.inputNodes;
        this.hiddenNodes = parsedModel.hiddenNodes;
        this.outputNodes = parsedModel.outputNodes;
        this.weightsInputToHidden = parsedModel.weightsInputToHidden;
        this.biasHidden = parsedModel.biasHidden;
        this.weightsHiddenToOutput = parsedModel.weightsHiddenToOutput;
        this.biasOutput = parsedModel.biasOutput;
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