import yargs from 'yargs';
import { NeuralNetwork } from './lib/deep.mjs';
import { NeuralNetworkV2 } from './lib/deepV2.mjs';
import { PreprocessingImage } from './lib/preprocessing.mjs';
import { Segmentation } from './lib/segmentation.mjs';
import { extractFeaturesAndSaveToExcel, readExcel } from './lib/extract.mjs';
import { ExtractFeature } from './lib/extractFeature.mjs';

import ExcelJS from 'exceljs';
import * as fs from 'node:fs';
import path from "node:path";


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
        type: {
            alias: 't',
            describe: 'type model',
            demandOption: true,
            type: 'integer',
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
        type: {
            alias: 't',
            describe: 'type model',
            demandOption: true,
            type: 'integer',
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

    const limit = 500;
    const threshold = 128;
    const width = 20;
    const height = 20;

    const preprocessing = new PreprocessingImage();
    const extractor = new ExtractFeature();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Features');

    // Kolom "Label" dan "Features" pada file Excel
    worksheet.columns = [
        { header: 'Label', key: 'label' },
        { header: 'Features', key: 'features' },
    ];

    const classFolders = fs.readdirSync(inputPath);

    // Iterasi melalui semua subfolder (kelas)
    for (const classFolder of classFolders) {
        const classFolderPath = path.join(inputPath, classFolder);

        if (fs.statSync(classFolderPath).isDirectory()) {
            const label = classFolder; // Gunakan nama subfolder sebagai label

            console.log("Processing Image class : ", label);

            // Iterasi melalui semua gambar dalam subfolder
            const imageFiles = fs.readdirSync(classFolderPath);

            // Batasi jumlah gambar yang akan diproses
            const limitedImageFiles = imageFiles.slice(0, limit);

            for (const imageFile of limitedImageFiles) {
                const imagePath = path.join(classFolderPath, imageFile);
                // Preprocessing
                await preprocessing.readImage(imagePath);
                await preprocessing.toBinary(threshold);
                var dataArray = await preprocessing.imageToArray('binary');
                var arrayImage = await preprocessing.removeBlackAreaAndResize(dataArray, width, height);

                // Extract Feature
                await extractor.loadArray(arrayImage);
                var dataFeatureLBP = await extractor.calculateLBP();
                var dataFeatureFlat = await extractor.flatten2DArray();
                var dataFeatureHog = await extractor.calculateHoG(6, 4, 9);

                var normalizeArrayLBP = await extractor.normalize1DArray(dataFeatureLBP, 0, 1);
                var normalizeArrayFlat = await extractor.normalize1DArray(dataFeatureFlat, 0, 1);
                var normalizeArrayHog = await extractor.normalize1DArray(dataFeatureHog, 0, 1);

                var normalizeArray = normalizeArrayLBP.concat(normalizeArrayFlat);
                var normalizeArray = normalizeArray.concat(normalizeArrayHog);

                worksheet.addRow({
                    label,
                    features: Array.isArray(normalizeArray) ? normalizeArray.join(', ') : '', // Pastikan setiap elemen adalah array
                });
            }
        }
    }

    // Simpan file Excel
    await workbook.xlsx.writeFile(outputPath);
    console.log('Features extracted and saved to Excel successfully.');

} else if (method === 'segment') {
    const inputPath = argv.input;
    const outputPath = argv.output;
    const threshold = 128;

    if (typeof threshold !== 'number') {
        console.error('Threshold must be a valid number.');
    } else {
        const preprocessing = new PreprocessingImage(inputPath);
        const segmentation = new Segmentation(50, 50);
        (async () => {
            try {
                await preprocessing.loadImage();
                await preprocessing.toBinary(threshold);

                var data = await preprocessing.imageToArray('binary');
                var invertData = await segmentation.invert(data);
                await segmentation.getSegementation(invertData);
                await segmentation.saveImage(outputPath);

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
    const typeModel = argv.type;

    readExcel(inputPath).then(data => {
        const { numberOfClass, labels, features } = data;

        const inputNodes = features[0].length;
        const outputNodes = numberOfClass;
        const hiddenNodes = Math.floor((inputNodes * outputNodes) / 5);
        const epochSize = 200;
        const learningRate = 0.01;

        if (typeModel === 2) {
            console.log('Input Node:', inputNodes);
            console.log('Hidden Node:', hiddenNodes);
            console.log('Output Node:', numberOfClass);

            const nn = new NeuralNetworkV2(inputNodes, hiddenNodes, outputNodes);
            nn.train(features, labels, epochSize, learningRate);

            const model = nn.getModel();
            nn.saveModel(outputPath, model);
        } else {
            console.log('Input Node:', inputNodes);
            console.log('Output Node:', numberOfClass);

            const nn = new NeuralNetwork(inputNodes, outputNodes);
            nn.train(features, labels, epochSize, learningRate);

            const model = nn.getModel();
            nn.saveModel(outputPath, model);
        }


    })

} else if (method === 'testing') {
    const inputPath = argv.input;
    const modelPath = argv.model;
    const typeModel = argv.type;


    readExcel(inputPath).then(data => {
        const { numberOfClass, labels, features } = data;
        if (typeModel === 2) {
            const nn = new NeuralNetworkV2(0, 0, 0);
            nn.loadModel(modelPath);
            const score = nn.test(features, labels);
            console.log("Score Test : ", score);
        } else {
            const nn = new NeuralNetwork(0, 0);
            nn.loadModel(modelPath);
            const score = nn.test(features, labels);
            console.log("Score Test : ", score);
        }

    })

}
