import Jimp from "jimp";
import { textLineSegmentation, charColumnSegmentation, invertBinaryArray2D, resizeArray2D, getArrayDimensions } from './imageArray.mjs'

export class Segmentation {
    constructor(width, height) {
        this.arrayData = [];
        this.resultSegment = [];
        this.width = width;
        this.height = height;
    }

    async invert(arrayData) {
        this.arrayData = invertBinaryArray2D(arrayData);
        return this.arrayData;
    }

    async getSegementation(arrayData) {
        this.arrayData = arrayData;
        var lineSegments = textLineSegmentation(this.arrayData);
        for (var i = 0; i < lineSegments.length; i++) {
            var characters = charColumnSegmentation(lineSegments[i]);
            this.resultSegment.push(characters);
        }
        return this.resultSegment;
    }

    async saveImage(outputPath) {
        for (var i = 0; i < this.resultSegment.length; i++) {
            for (var j = 0; j < this.resultSegment[i].length; j++) {

                var resized = resizeArray2D(this.resultSegment[i][j], this.width, this.height);
                var image = arrayBinerToImage(resized);
                saveImage(image, outputPath + "\\segment_" + i + "_" + j + ".jpg");
            }
        }
    }
}

function saveImage(image, outputPath) {
    if (image) {
        image.write(outputPath);
    }
}

function arrayBinerToImage(pixelArray) {
    const dimension = getArrayDimensions(pixelArray);

    var image = new Jimp(dimension.width, dimension.height);
    for (let y = 0; y < dimension.height; y++) {
        for (let x = 0; x < dimension.width; x++) {
            var hexdata = 0xFF000000;
            if (pixelArray[y][x] === 1) {
                hexdata = 0xFFFFFFFF
            }
            image.setPixelColor(hexdata, x, y);
        }
    }
    return image;
}