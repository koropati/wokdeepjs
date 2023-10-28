import Jimp from "jimp";

import { removeExcessBlackArea, resizeArray2D } from "./imageArray.mjs";

export class PreprocessingImage {
    constructor(imagePath) {
        this.imagePath = imagePath;
        this.image = null;
    }

    async readImage(imagePath) {
        this.imagePath = imagePath;
        this.image = await Jimp.read(this.imagePath);
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

    async prepWaterMeter(threshold = 128) {
        if (!this.image) {
            await this.loadImage();
        }
        this.image.rgba(false).greyscale().contrast(1).posterize(2)
        this.image = this.image.threshold({ max: threshold, autoGreyscale: false });

        // Set warna putih pada bagian bawah citra
        const halfHeight = this.image.bitmap.height / 2;
        for (let x = 0; x < this.image.bitmap.width; x++) {
            for (let y = halfHeight; y < this.image.bitmap.height; y++) {
                this.image.setPixelColor(0xFFFFFFFF, x, y);
            }
        }
    }

    async getImage() {
        return this.image;
    }

    async imageToArray(typeImage = 'gray') {
        if (!this.image) {
            await this.loadImage();
        }

        const width = this.image.bitmap.width;
        const height = this.image.bitmap.height;
        const pixelArray = [];

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const pixelColor = this.image.getPixelColor(x, y);
                const rgba = Jimp.intToRGBA(pixelColor);
                if (typeImage === 'gray') {
                    const val = (0.299 * rgba.r) + (0.587 * rgba.g) + (0.114 * rgba.b);
                    row.push(val);
                } else if (typeImage === 'binary') {
                    const val = (0.299 * rgba.r) + (0.587 * rgba.g) + (0.114 * rgba.b);
                    if (val < 128) {
                        row.push(0);
                    } else {
                        row.push(1);
                    }
                } else {
                    row.push([rgba.r][rgba.g][rgba.b]);
                }
            }
            pixelArray.push(row);
        }

        return pixelArray;
    }

    async removeBlackAreaAndResize(arrayInput, width, height){
        var dataArray = removeExcessBlackArea(arrayInput, 0, 0);
        var result = resizeArray2D(dataArray, width, height);
        return result;
    }

    async arrayToImage(pixelArray, width, height) {
        if (pixelArray.length !== height || pixelArray[0].length !== width) {
            throw new Error('Array size does not match the specified width and height.');
        }

        this.image = new Jimp(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelColor = pixelArray[y * width + x];
                this.image.setPixelColor(pixelColor, x, y);
            }
        }
    }

    async arrayBinerToImage(pixelArray, width, height) {
        if (pixelArray.length !== height || pixelArray[0].length !== width) {
            throw new Error('Array size does not match the specified width and height.');
        }

        this.image = new Jimp(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                var hexdata = 0xFF000000;
                if (pixelArray[y][x] === 1) {
                    hexdata = 0xFFFFFFFF
                }
                this.image.setPixelColor(hexdata, x, y);
            }
        }
    }
}
