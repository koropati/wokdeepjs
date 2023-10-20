import Jimp from "jimp";

export class PreprocessingImage {
    constructor(imagePath) {
        this.imagePath = imagePath;
        this.image = null;
    }

    async loadImage() {
        this.image = await Jimp.read(this.imagePath);
    }

    async toGrayscale() {
        if (!this.image) {
            await this.loadImage();
        }
        this.image.grayscale();
    }

    async toBinary(threshold = 128) {
        if (!this.image) {
            await this.loadImage();
        }
        this.image = this.image.threshold(threshold);
    }

    async saveFeatureExtraction(outputPath) {
        if (!this.image) {
            await this.loadImage();
        }
        await this.image.write(outputPath);
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