import Jimp from "jimp";

import {
    resizeArray2D,
    getArrayDimension,
    getArrayDimensions,
    normalizeImageArray,
    removePaddingArrayBiner,
    erodeBinaryArray,
    dilateBinaryArray,
    logicalAndArrays,
    logicalXorArrays,
    logicalOrArrays,
    logicalNotArrays,
    logicalNandArrays,
    logicalNorArrays,
    logicalXnorArrays,
    invertBinaryArray2D,
    detectObjects,
    detectHigherObjects,
    getSubArrayUsingWidthHeight,
    convertEdgeToBlackWithThickness,
    getHigherTextLineSegmentation,
    charColumnSegmentation,
} from "./imageArray.mjs";

export class PreprocessingImage {
    constructor(imagePath) {
        this.imagePath = imagePath;
        this.image = null;
        this.karnelErode = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ];
        this.karnelDilate = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ];

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

    async prepWaterMeter(threshold = 128, charWidth = 20, charHeight = 35) {
        if (!this.image) {
            await this.loadImage();
        }
        var dataArray = [];
        var originalArray = [];
        var invertedArray = [];
        var dataChar = [];
        var coordinate = null;

        this.image.rgba(false).greyscale().contrast(1).posterize(2)
        this.image = await this.image.threshold({ max: threshold, autoGreyscale: false });

        dataArray = await this.imageToArray('binary');
        dataArray = await this.removePaddingArrayBiner(dataArray);
        originalArray = dataArray;

        dataArray = await this.invertArrayBiner(dataArray);
        invertedArray = dataArray;

        dataArray = await this.erodeArrayBiner(dataArray, 3);
        dataArray = await this.dilateArrayBiner(dataArray, 4);
        dataArray = await this.erodeArrayBiner(dataArray, 7);
        dataArray = await this.dilateArrayBiner(dataArray, 4);
        dataArray = await this.erodeArrayBiner(dataArray, 1);

        dataArray = await this.logicalAndArrayBiner(dataArray, invertedArray);

        dataArray = await this.dilateArrayBiner(dataArray, 8);
        dataArray = await this.erodeArrayBiner(dataArray, 1);

        coordinate = await this.detectHigherObjectArrayBiner(dataArray);

        dataArray = await this.getSubArray(originalArray, coordinate.x, coordinate.y, coordinate.w, coordinate.h);
        dataArray = await this.resizeArray2D(dataArray, 395, 75);
        dataArray = await this.convertEdgeToBlackArrayBinary(dataArray, 8);
        dataArray = await this.getHigherTextLineArrayBiner(dataArray);

        dataChar = await this.getCharSegementationArrayBiner(dataArray, charWidth, charHeight);
        
        return dataChar;
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

    async removePaddingArrayBiner(arrayInput) {
        return removePaddingArrayBiner(arrayInput);
    }

    async resizeArray2D(arrayInput, width, height) {
        return resizeArray2D(arrayInput, width, height);
    }

    async removeBlackAreaAndResize(arrayInput, width, height) {
        var dataArray = removePaddingArrayBiner(arrayInput);
        var result = resizeArray2D(dataArray, width, height);
        return result;
    }

    async erodeArrayBiner(arrayInput, step = 1) {
        var result = arrayInput;
        for (var i = 0; i < step; i++) {
            result = erodeBinaryArray(result, this.karnelErode);
        }
        return result;
    }

    async dilateArrayBiner(arrayInput, step = 1) {
        var result = arrayInput;
        for (var i = 0; i < step; i++) {
            result = dilateBinaryArray(result, this.karnelDilate);
        }
        return result;
    }
    async logicalAndArrayBiner(array1, array2) {
        return logicalAndArrays(array1, array2);
    }

    async logicalOrArrayBiner(array1, array2) {
        return logicalOrArrays(array1, array2);
    }

    async logicalNotArrayBiner(array) {
        return logicalNotArrays(array);
    }

    async logicalXorArrayBiner(array1, array2) {
        return logicalXorArrays(array1, array2);
    }

    async logicalNandArrayBiner(array1, array2) {
        return logicalNandArrays(array1, array2);
    }

    async logicalNorArrayBiner(array1, array2) {
        return logicalNorArrays(array1, array2);
    }

    async logicalXnorArrayBiner(array1, array2) {
        return logicalXnorArrays(array1, array2);
    }

    async invertArrayBiner(array) {
        return invertBinaryArray2D(array);
    }

    async detectObjectArrayBiner(array) {
        return detectObjects(array);
    }

    async detectHigherObjectArrayBiner(array) {
        return detectHigherObjects(array);
    }

    async getSubArray(array, x, y, w, h) {
        return getSubArrayUsingWidthHeight(array, x, y, w, h);
    }

    async convertEdgeToBlackArrayBinary(array, thickness) {
        return convertEdgeToBlackWithThickness(array, thickness);
    }

    async getHigherTextLineArrayBiner(array) {
        return getHigherTextLineSegmentation(array);
    }

    async getCharSegementationArrayBiner(array, charWidth, charHeight) {
        var chars = charColumnSegmentation(array);
        for(var i = 0; i < chars.length; i++){
            chars[i] = resizeArray2D(chars[i], charWidth, charHeight);
        }
        return chars
    }

    async arrayToImage(pixelArray) {

        const dimension = getArrayDimensions(pixelArray);
        pixelArray = normalizeImageArray(pixelArray);

        this.image = new Jimp(dimension.width, dimension.height);
        for (let y = 0; y < dimension.height; y++) {
            for (let x = 0; x < dimension.width; x++) {
                var r = 0;
                var g = 0;
                var b = 0;
                var a = 255;
                if (getArrayDimension(pixelArray) === 3) {
                    r = pixelArray[y][x][0];
                    g = pixelArray[y][x][1];
                    b = pixelArray[y][x][2];
                } else if (getArrayDimension(pixelArray) === 2) {
                    r = pixelArray[y][x];
                    g = pixelArray[y][x];
                    b = pixelArray[y][x];
                } else {
                    r = pixelArray[y][x];
                    g = pixelArray[y][x];
                    b = pixelArray[y][x];
                }

                var numColor = Jimp.rgbaToInt(r, g, b, a);
                this.image.setPixelColor(numColor, x, y);
            }
        }
    }

    async arrayBinerToImage(pixelArray) {
        const dimension = getArrayDimensions(pixelArray);

        this.image = new Jimp(dimension.width, dimension.height);
        for (let y = 0; y < dimension.height; y++) {
            for (let x = 0; x < dimension.width; x++) {
                var hexdata = 0xFF000000;
                if (pixelArray[y][x] === 1) {
                    hexdata = 0xFFFFFFFF
                }
                this.image.setPixelColor(hexdata, x, y);
            }
        }
    }

}
