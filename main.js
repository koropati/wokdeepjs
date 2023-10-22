import yargs from 'yargs';
import { NeuralNetwork } from './lib/deep.mjs';
import { PreprocessingImage } from './lib/preprocessing.mjs';
import { extractFeaturesAndSaveToExcel, readExcel } from './lib/extract.mjs';


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

} else if (method === 'training') {
    const inputPath = argv.input;
    const outputPath = argv.output; // Lokasi penyimpanan model

    readExcel(inputPath).then(data => {
        const { numberOfClass, labels, features } = data;

        const inputNodes = features[0].length;
        const outputNodes = numberOfClass;
        const epochSize = 100;
        const learningRate = 0.1;

        console.log('Panjang Fitur Vektor:', inputNodes);
        console.log('Jumlah Kelas:', numberOfClass);

        const nn = new NeuralNetwork(inputNodes, outputNodes);

        nn.train(features, labels, epochSize, learningRate);

        (async () => {
            const model = nn.getModel();
            await nn.saveModel(outputPath, model);
        })();

    })
}
