import { NeuralNetwork } from './lib/deep.mjs';

import * as fs from 'node:fs';
import path from 'node:path';

const modelName = 'model.json';
const folderPath = path.join('model', modelName);

const inputNodes = 4;
const outputNodes = 1;
const epochSize = 100;
const learningRate = 0.1;

const nn = new NeuralNetwork(inputNodes, outputNodes);


const irisData = [
    [5.1, 3.5, 1.4, 0.2], // Sample 1: Sepal length, sepal width, petal length, petal width for Iris setosa
    [4.9, 3.0, 1.4, 0.2], // Sample 2: Sepal length, sepal width, petal length, petal width for Iris setosa
    // ... (data lainnya)
    [6.3, 3.3, 6.0, 2.5], // Sample 149: Sepal length, sepal width, petal length, petal width for Iris virginica
    [5.9, 3.0, 5.1, 1.8]  // Sample 150: Sepal length, sepal width, petal length, petal width for Iris virginica
  ];

const irisLabel = [0,0,1,1];

nn.train(irisData, irisLabel, epochSize, learningRate);

const model = nn.getModel();
// Simpan data dalam berkas JSON
fs.writeFileSync(folderPath, model, 'utf-8', (err) => {
    if (err) {
        console.error('Gagal menyimpan berkas:', err);
    } else {
        console.log('Model berhasil disimpan dalam', folderPath);
    }
});


const newInput = [5.0, 3.2, 1.3, 0.2];
const prediction = nn.forwardPropagate(newInput);

console.log("Prediction is : ", prediction);