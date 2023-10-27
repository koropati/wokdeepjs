
import * as fs from 'node:fs';

export class NeuralNetwork {
    constructor(inputNodes, numClasses) {
        this.inputNodes = inputNodes;
        this.outputNodes = numClasses;
        this.weights = new Array(numClasses).fill(0).map(() => new Array(inputNodes).fill(0).map(() => Math.random()));
        this.bias = new Array(numClasses).fill(0).map(() => Math.random());
        this.errRate = 1.0;
    
        // console.log("BOBOT: ", this.weights);
        // console.log("BIAS: ", this.bias);
    }

    forwardPropagate(inputs) {
        const activatedOutputs = [];
        for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
            const output = inputs.reduce((sum, input, index) => {
                return sum + input * this.weights[outputNode][index];
            }, 0) + this.bias[outputNode];
            const activatedOutput = this.sigmoid(output);
            activatedOutputs.push(activatedOutput);
        }
    
        // Temukan indeks kelas dengan probabilitas tertinggi
        // const predictedClass = activatedOutputs.indexOf(Math.max(...activatedOutputs));
    
        // return predictedClass; // Hasilnya adalah indeks kelas yang diprediksi
        return activatedOutputs;
    }

    backwardPropagate(inputs, targets, learningRate) {
        const errors = new Array(this.outputNodes).fill(0);
        // Calculate the errors
        for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
            const output = this.forwardPropagate(inputs)[outputNode];
            errors[outputNode] = targets[outputNode] - output;
        }
        // Adjust weights and bias using gradient descent
        for (let outputNode = 0; outputNode < this.outputNodes; outputNode++) {
            for (let i = 0; i < this.weights[outputNode].length; i++) {
                this.weights[outputNode][i] += learningRate * errors[outputNode] * inputs[i];
            }
            this.bias[outputNode] += learningRate * errors[outputNode];
        }
        return errors;
    }

    crossEntropyLoss(predicted, actual) {
        if (predicted.length !== actual.length) {
            throw new Error("Panjang predicted dan actual harus sama.");
        }
    
        const n = predicted.length;
        let loss = 0;
    
        for (let i = 0; i < n; i++) {
            loss -= actual[i] * Math.log(predicted[i] + 1e-15); // Menghindari pembagian oleh nol
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
            var predicted = new Array(this.outputNodes).fill(0).map(() => 0);
            var loss = 0;
            for (let i = 0; i < inputsArray.length; i++) {
                const inputs = inputsArray[i];
                const targets = targetsArray[i];
                // Forward propagation
                predicted = this.forwardPropagate(inputs);
                // Backward propagation dan perbarui bobot dan bias
                // totalError += errors.reduce((sum, error) => sum + error, 0);
                loss = this.crossEntropyLoss(predicted, targets);
                this.backwardPropagate(inputs, targets, learningRate);
            }
            console.log("Epoch", epoch + 1, "Total Error:", loss);
        }
    }

    test(inputFeatureArray, actualTargetArray) {
        console.log("TARGET: ", actualTargetArray);
        var scoreArray = new Array(inputFeatureArray.length).fill(0).map(() => 0);
        for (let i = 0; i < inputFeatureArray.length; i++) {
            const inputs = inputFeatureArray[i];
            const targets = actualTargetArray[i];
            
            

            const predicted = this.forwardPropagate(inputs);
            const predictedIndex = this.getIndexFromHigherValue(predicted);
            const targetIndex = this.getIndexFromHigherValue(targets);

            console.log("Predicted: ", predictedIndex, " Actual: ", targetIndex);
            
            if (predictedIndex === targetIndex){
                scoreArray[i] = 1;
            }else{
                scoreArray[i] = 0;
            }
        }
        const finalScore = this.countTrueLabel(scoreArray)/scoreArray.length;
        return finalScore;
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
        const dataModel = fs.readFileSync(model, 'utf-8');
        const parsedModel = JSON.parse(dataModel);
        // console.log("inputNodes: ", parsedModel.inputNodes);
        // console.log("outputNodes: ", parsedModel.outputNodes);
        // console.log("weights: ", parsedModel.weights);
        // console.log("bias: ", parsedModel.bias);
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