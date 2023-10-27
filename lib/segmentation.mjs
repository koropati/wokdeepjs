import Jimp from 'jimp';
import { PreprocessingImage } from './preprocessing.mjs';

export class Segmentation {
    constructor(inputPath) {
        this.inputPath = inputPath;
    }

    async segmentCharacters() {
        // const image = await Jimp.read(this.inputPath);
        const preprocessing = new PreprocessingImage(this.inputPath);
        await preprocessing.toBinary(128);
        const image = await preprocessing.getImage();
        const components = await this.findConnectedComponents(image);
        const segmentedImages = [];

        for (let i = 0; i < components.length; i++) {
            console.log("masuk. 1");
            const component = components[i];
            const characterImage = await this.cropCharacter(image, component);
            segmentedImages.push(characterImage);
        }

        return segmentedImages;
    }

    async saveSegmentedCharacters(outputPath) {
        const segmentedImages = await this.segmentCharacters(this.inputPath);
        if (segmentedImages.length === 0) {
            console.log("Tidak ada karakter yang ditemukan.");
            return;
        }

        fs.mkdirSync(outputPath, { recursive: true }); // Membuat folder output jika belum ada

        for (let i = 0; i < segmentedImages.length; i++) {
            console.log("masuk.");
            const outputFilePath = path.join(outputPath, `character_${i}.png`);
            await segmentedImages[i].write(outputFilePath);
        }

        console.log(`Gambar karakter yang di-segmentasi berhasil disimpan di ${outputPath}`);
    }

    async findConnectedComponents(image) {
        const components = [];
        const visited = new Set(); // Menyimpan pixel yang sudah dikunjungi

        // Implementasi fungsi DFS untuk mencari komponen terhubung
        const dfs = (x, y) => {
            if (x < 0 || x >= image.bitmap.width || y < 0 || y >= image.bitmap.height) {
                return; // Di luar batas gambar
            }
            if (visited.has(`${x}-${y}`)) {
                return; // Sudah dikunjungi
            }

            visited.add(`${x}-${y}`);

            if (image.getPixelColor(x, y) === 0) {
                return; // Bukan bagian dari karakter (hitam)
            }

            let component = { x, y, width: 0, height: 0 };

            // Mengecek ke atas, bawah, kiri, dan kanan
            component.width += 1;
            dfs(x - 1, y);
            dfs(x + 1, y);

            component.height += 1;
            dfs(x, y - 1);
            dfs(x, y + 1);

            components.push(component);
        };

        for (let x = 0; x < image.bitmap.width; x++) {
            for (let y = 0; y < image.bitmap.height; y++) {
                if (!visited.has(`${x}-${y}`) && image.getPixelColor(x, y) === 0) {
                    dfs(x, y);
                }
            }
        }

        return components;
    }
}