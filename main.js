import yargs from 'yargs';
import { NeuralNetwork } from './lib/deep.mjs';
import { normalizeArray2D, invertBinaryArray2D, textLineSegmentation, charColumnSegmentation, getArrayDimensions, PreprocessingImage } from './lib/preprocessing.mjs';
import { extractFeaturesAndSaveToExcel, readExcel } from './lib/extract.mjs';
// import { TextSegmentation } from './lib/textSegement.mjs';


const argv = yargs
    .command('gray', 'Proses konversi gambar ke grayscale', {
        input: {
            alias: 'i',
            describe: 'Lokasi gambar yang akan dikonversi',
            demandOption: true,
            type: 'string',
        },
        output: {
            alias: 'o',
            describe: 'Lokasi hasil konversi gambar',
            demandOption: true,
            type: 'string',
        },
    })

    .command('biner', 'Proses konversi gambar ke biner', {
        input: {
            alias: 'i',
            describe: 'Lokasi gambar yang akan dikonversi',
            demandOption: true,
            type: 'string',
        },
        output: {
            alias: 'o',
            describe: 'Lokasi hasil konversi gambar',
            demandOption: true,
            type: 'string',
        },
    })

    .command('prepwater', 'Proses preprocessing water meter', {
        input: {
            alias: 'i',
            describe: 'Path lokasi gambar yang akan dipreprocessing',
            demandOption: true,
            type: 'string',
        },
        output: {
            alias: 'o',
            describe: 'Folder lokasi hasil preprocessing',
            demandOption: true,
            type: 'string',
        },
    })

    .command('segment', 'Proses segmentasi gambar', {
        input: {
            alias: 'i',
            describe: 'Path lokasi gambar yang akan disegmentasi',
            demandOption: true,
            type: 'string',
        },
        output: {
            alias: 'o',
            describe: 'Folder lokasi file segmentasi',
            demandOption: true,
            type: 'string',
        },
    })

    .command('extract', 'Proses ekstraksi fitur', {
        input: {
            alias: 'i',
            describe: 'Folder Lokasi gambar yang akan ekstraksi',
            demandOption: true,
            type: 'string',
        },
        output: {
            alias: 'o',
            describe: 'Folder lokasi file ekstraksi',
            demandOption: true,
            type: 'string',
        },
    })

    .command('training', 'Latih model', {
        input: {
            alias: 'i',
            describe: 'Input path file excel dataset',
            demandOption: true,
            type: 'string',
        },
        output: {
            alias: 'o',
            describe: 'Lokasi penyimpanan model',
            demandOption: true,
            type: 'string',
        },
    })

    .command('testing', 'Testing model', {
        model: {
            alias: 'm',
            describe: 'Input path file model json',
            demandOption: true,
            type: 'string',
        },
        input: {
            alias: 'i',
            describe: 'Lokasi data test',
            demandOption: true,
            type: 'string',
        },
    })

    .help()
    .argv;

const method = argv._[0];

if (method === 'gray') {
    const inputPath = argv.input;
    const outputPath = argv.output;
    const preprocessing = new PreprocessingImage(inputPath);
    (async () => {
        await preprocessing.loadImage();
        await preprocessing.toGrayscale();
        await preprocessing.saveImage(outputPath);
    })();

} else if (method === 'biner') {
    const inputPath = argv.input;
    const outputPath = argv.output;
    const threshold = 128; // Set your desired threshold value here

    if (typeof threshold !== 'number') {
        console.error('Threshold must be a valid number.');
    } else {
        const preprocessing = new PreprocessingImage(inputPath);
        (async () => {
            try {
                await preprocessing.loadImage();
                await preprocessing.toBinary(threshold);
                await preprocessing.saveImage(outputPath, 1);
                console.log('Image converted to binary successfully.');
            } catch (error) {
                console.error('Error processing the image:', error);
            }
        })();
    }
} else if (method === 'extract') {
    const inputPath = argv.input;
    const outputPath = argv.output;

    extractFeaturesAndSaveToExcel(inputPath, outputPath, 20, 20, 100)
        .then(() => console.log('Feature extraction completed.'))
        .catch(error => console.error('Error:', error));

} else if (method === 'segment') {
    const inputPath = argv.input;
    const outputPath = argv.output;
    const threshold = 128; // Set your desired threshold value here

    if (typeof threshold !== 'number') {
        console.error('Threshold must be a valid number.');
    } else {
        const preprocessing = new PreprocessingImage(inputPath);
        (async () => {
            try {
                await preprocessing.loadImage();
                await preprocessing.toBinary(threshold);
                // await preprocessing.saveImage(outputPath, 1);
                console.log('Image converted to binary successfully.');
                var data = await preprocessing.imageToArray();
                data = normalizeArray2D(data);
                data = invertBinaryArray2D(data);
                console.log("data length: ", getArrayDimensions(data))
                var lineSegment = textLineSegmentation(data);
                var character = charColumnSegmentation(lineSegment[0]);

                for (var i = 0; i < character.length; i++) {
                    var dimension = getArrayDimensions(character[i]);
                    await preprocessing.arrayBinerToImage(character[i], dimension.width, dimension.height)
                    await preprocessing.saveImage(outputPath + "-" + i + ".jpg");
                }
                // console.log("character Segment: ", character[0]);

                // var dimension = getArrayDimensions(character[2]);
                // await preprocessing.arrayBinerToImage(character[2], dimension.width, dimension.height)
                // await preprocessing.saveImage(outputPath);
                // console.log("segment: ", getArrayDimensions(lineSegment[0]));

            } catch (error) {
                console.error('Error processing the image:', error);
            }
        })();
    }

} else if (method === 'prepwater') {
    const inputPath = argv.input;
    const outputPath = argv.output;
    const threshold = 128; // Set your desired threshold value here

    if (typeof threshold !== 'number') {
        console.error('Threshold must be a valid number.');
    } else {
        const preprocessing = new PreprocessingImage(inputPath);
        (async () => {
            try {
                await preprocessing.loadImage();
                await preprocessing.prepWaterMeter(threshold);
                await preprocessing.saveImage(outputPath, 1);
                console.log('Image converted to binary successfully.');
            } catch (error) {
                console.error('Error processing the image:', error);
            }
        })();
    }

} else if (method === 'training') {
    const inputPath = argv.input;
    const outputPath = argv.output; // Lokasi penyimpanan model

    readExcel(inputPath).then(data => {
        const { numberOfClass, labels, features } = data;

        const inputNodes = features[0].length;
        const outputNodes = numberOfClass;
        const epochSize = 200;
        const learningRate = 0.01;

        console.log('Panjang Fitur Vektor:', inputNodes);
        console.log('Jumlah Kelas:', numberOfClass);

        const nn = new NeuralNetwork(inputNodes, outputNodes);

        nn.train(features, labels, epochSize, learningRate);

        (async () => {
            const model = nn.getModel();
            await nn.saveModel(outputPath, model);
        })();

    })
} else if (method === 'testing') {
    const inputPath = argv.input;
    const modelPath = argv.model;

    const nn = new NeuralNetwork(0, 0);

    readExcel(inputPath).then(data => {
        const { numberOfClass, labels, features } = data;

        console.log("labels: ", labels);

        // const inputNodes = features[0].length;
        // const outputNodes = numberOfClass;
        // const epochSize = 100;
        // const learningRate = 0.1;

        // console.log('Panjang Fitur Vektor:', inputNodes);
        // console.log('Jumlah Kelas:', numberOfClass);

        // const nn = new NeuralNetwork(inputNodes, outputNodes);

        // nn.train(features, labels, epochSize, learningRate);

        (async () => {
            await nn.loadModel(modelPath);
            const score = nn.test(features, labels);
            console.log("Score Test : ", score);
        })();

    })



    // readExcel(inputPath).then(data => {
    //     const {_, actualLabels, features} = data;

    //     console.log("actualLabels: ", actualLabels);
    //     // console.log("features: ", features);

    //     // (async () => {
    //     //     await nn.loadModel(modelPath);
    //     //     const score = nn.test(features, actualLabels);
    //     //     console.log("Score Test : ", score);
    //     // })();



    // })

}
