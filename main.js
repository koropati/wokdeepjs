import yargs from 'yargs';
import { NeuralNetwork } from './lib/deep.mjs';
import { PreprocessingImage } from './lib/preprocessing.mjs';

const argv = yargs
    .command('preprocess', 'Proses gambar', {
        output: {
            alias: 'o',
            describe: 'Lokasi penyimpanan gambar hasil preprocessing',
            demandOption: true,
            type: 'string',
        },
    })
    .command('training', 'Latih model', {
        output: {
            alias: 'o',
            describe: 'Lokasi penyimpanan model',
            demandOption: true,
            type: 'string',
        },
    })
    .help()
    .argv;

const method = argv._[0];

if (method === 'preprocess') {
    const imagePath = 'path/ke/gambar.jpg'; // Ganti dengan path gambar yang ingin diolah
    const outputPath = argv.output; // Lokasi penyimpanan gambar hasil preprocessing

    const preprocessing = new PreprocessingImage(imagePath);

    (async () => {
        await preprocessing.loadImage();
        await preprocessing.toGrayscale();
        await preprocessing.saveFeatureExtraction(outputPath);
    })();
} else if (method === 'training') {
    // const modelPath = 'model/model.json'; // Ganti dengan path model yang ingin dilatih
    const outputPath = argv.output; // Lokasi penyimpanan model

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

    const irisLabel = [0, 0, 1, 1];
    nn.train(irisData, irisLabel, epochSize, learningRate);

    (async () => {
        // Lakukan pelatihan model di sini
        // Simpan model setelah pelatihan
        const model = nn.getModel();
        await nn.saveModel(outputPath, model);
    })();

    const newInput = [5.0, 3.2, 1.3, 0.2];
    const prediction = nn.forwardPropagate(newInput);

    console.log("Prediction is : ", prediction);
}
