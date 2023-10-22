import Jimp from "jimp";
import ExcelJS from 'exceljs';
import * as fs from 'node:fs';
import path from "node:path";

export class ExtractFeature {
    constructor(imagePath) {
        this.imagePath = imagePath;
        this.image = null;
    }

    async loadImage() {
        this.image = await Jimp.read(this.imagePath);
    }

    async extractBiner(width, height) {
        if (!this.image) {
            await this.loadImage();
        }

        this.image.resize(width, height);

        const binerArray = [];
        this.image.scan(0, 0, this.image.bitmap.width, this.image.bitmap.height, function (x, y, idx) {
            // Mengambil nilai biner dari pixel
            const r = this.bitmap.data[idx];
            binerArray.push(r === 0 ? 0 : 1);
        });

        return binerArray;
    }
}

export async function extractFeaturesAndSaveToExcel(inputPath, outputPath, width, height, limit) {
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
                const extractor = new ExtractFeature(imagePath);

                // Load gambar dan ekstraksi fitur biner
                await extractor.loadImage();
                const binerArray = await extractor.extractBiner(width, height); // Ganti dengan lebar dan tinggi yang sesuai

                console.log("PATH: ", imagePath, " FEATURE: ", binerArray);

                worksheet.addRow({
                    label,
                    features: Array.isArray(binerArray) ? binerArray.join(', ') : '', // Pastikan setiap elemen adalah array
                });

                // Simpan hasil ekstraksi fitur ke file Excel
                // binerArray.forEach((features, index) => {
                //     worksheet.addRow({
                //         label,
                //         features: Array.isArray(features) ? features.join(', ') : '', // Pastikan setiap elemen adalah array
                //     });
                // });
            }
        }
    }

    // Simpan file Excel
    await workbook.xlsx.writeFile(outputPath);
    console.log('Features extracted and saved to Excel successfully.');
}

export async function readExcel(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath); // Membaca file Excel

    const worksheet = workbook.getWorksheet('Features'); // Sesuaikan dengan nama worksheet Anda

    const labels = []; // Array untuk label
    const features = []; // Array untuk fitur vektor

    const values = [];
    var numberOfClass = 0;

    // Iterasi melalui baris-baris dalam kolom yang ditentukan
    worksheet.getColumn("A").eachCell((cell, rowNumber) => {
        if (rowNumber !== 1) { // Melewati baris judul (header)
            const value = cell.value;
            if (!isNaN(value)) {
                values.push(value);
            }
        }
    });

    const uniqLabels = new Set(values);
    numberOfClass = uniqLabels.size;

    // Iterasi melalui baris-baris dalam worksheet
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) { // Melewati baris judul (header)
            const label = row.getCell(1).value; // Kolom "Label"
            const featureStr = row.getCell(2).value; // Kolom "Features"

            const featureArray = featureStr.split(',').map(parseFloat); // Mengubah string fitur menjadi array angka

            // Buat representasi one-hot encoding untuk label
            const oneHotLabel = new Array(numberOfClass).fill(0);
            oneHotLabel[label] = 1;

            labels.push(oneHotLabel);
            features.push(featureArray);
        }
    });

    return { numberOfClass, labels, features };
}