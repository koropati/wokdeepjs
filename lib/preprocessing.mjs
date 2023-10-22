import Jimp from "jimp";
import floydSteinberg from 'floyd-steinberg';

export class PreprocessingImage {
    constructor(imagePath) {
        this.imagePath = imagePath;
        this.image = null;
    }

    async loadImage() {
        this.image = await Jimp.read(this.imagePath);
    }

    async saveImage(outputPath, quality = 100) {
        if (!this.image) {
            await this.loadImage();
        }
        await this.image.write(outputPath);
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
        this.image.rgba(false).greyscale().contrast(1).posterize(2)
        this.image = this.image.threshold({ max: threshold, autoGreyscale: false });
        // this.image.bitmap = floydSteinberg(this.image.bitmap)
    }
}