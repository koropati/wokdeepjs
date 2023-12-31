export class ExtractFeature {
    constructor(imageArray) {
        this.imageArray = imageArray;
    }

    async loadArray(arrayInput) {
        this.imageArray = arrayInput;
    }

    async calculateHoG(cellSize, blockSize, bins) {
        const [height, width] = [this.imageArray.length, this.imageArray[0].length];

        // Hitung gradien gambar menggunakan metode Sobel atau metode lainnya
        const gradient = calculateGradient(this.imageArray);

        // Hitung magnitudo dan orientasi gradien
        const magnitude = calculateMagnitude(gradient);
        const orientation = calculateOrientation(gradient);

        const blockCountX = Math.floor(width / (cellSize * blockSize));
        const blockCountY = Math.floor(height / (cellSize * blockSize));
        const histogramSize = blockCountX * blockCountY * blockSize * blockSize * bins;

        // Inisialisasi array fitur HoG
        const hogFeatures = new Array(histogramSize).fill(0);

        // Iterasi untuk mengisi blok HoG
        for (let i = 0; i < blockCountY; i++) {
            for (let j = 0; j < blockCountX; j++) {
                // Inisialisasi histogram blok
                const blockHistogram = new Array(bins).fill(0);

                for (let y = 0; y < blockSize; y++) {
                    for (let x = 0; x < blockSize; x++) {
                        const pixelY = i * cellSize * blockSize + y * cellSize;
                        const pixelX = j * cellSize * blockSize + x * cellSize;

                        const cellMagnitude = magnitude.slice(pixelY, pixelY + cellSize)
                            .map(row => row.slice(pixelX, pixelX + cellSize))
                            .reduce((a, b) => a.concat(b), []);

                        const cellOrientation = orientation.slice(pixelY, pixelY + cellSize)
                            .map(row => row.slice(pixelX, pixelX + cellSize))
                            .reduce((a, b) => a.concat(b), []);

                        // Hitung histogram sel
                        for (let k = 0; k < cellMagnitude.length; k++) {
                            const bin = Math.floor((cellOrientation[k] + 180) / (360 / bins));
                            blockHistogram[bin] += cellMagnitude[k];
                        }
                    }
                }

                // Normalisasi histogram blok
                const epsilon = 1e-4;
                const blockMagnitude = Math.sqrt(blockHistogram.reduce((acc, val) => acc + val * val, 0) + epsilon);
                for (let k = 0; k < blockHistogram.length; k++) {
                    blockHistogram[k] /= (blockMagnitude + epsilon);
                }

                // Masukkan histogram blok ke fitur HoG
                const start = (i * blockCountX + j) * blockSize * blockSize * bins;
                for (let k = 0; k < blockHistogram.length; k++) {
                    hogFeatures[start + k] = blockHistogram[k];
                }
            }
        }

        return hogFeatures;
    }

    async calculateLBP() {
        const height = this.imageArray.length;
        const width = this.imageArray[0].length;

        const lbpFeatures = [];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const center = this.imageArray[y][x];
                let pattern = 0;
                pattern |= (this.imageArray[y - 1][x - 1] >= center) << 0;
                pattern |= (this.imageArray[y - 1][x] >= center) << 1;
                pattern |= (this.imageArray[y - 1][x + 1] >= center) << 2;
                pattern |= (this.imageArray[y][x + 1] >= center) << 3;
                pattern |= (this.imageArray[y + 1][x + 1] >= center) << 4;
                pattern |= (this.imageArray[y + 1][x] >= center) << 5;
                pattern |= (this.imageArray[y + 1][x - 1] >= center) << 6;
                pattern |= (this.imageArray[y][x - 1] >= center) << 7;

                lbpFeatures.push(pattern);
            }
        }

        return lbpFeatures;
    }

    async calculateChainCode(startX, startY) {
        // Daftar arah perubahan (delta) dalam urutan Chain Code
        const chainCodeDelta = [
            [-1, 0], [-1, 1], [0, 1], [1, 1],
            [1, 0], [1, -1], [0, -1], [-1, -1]
        ];

        const chainCode = [];
        let x = startX;
        let y = startY;
        let direction = 0; // Arah awal

        do {
            // Iterasi melalui arah rantai
            for (let i = 0; i < 8; i++) {
                // Tentukan koordinat berikutnya
                const nextX = x + chainCodeDelta[direction][0];
                const nextY = y + chainCodeDelta[direction][1];

                // Jika koordinat berikutnya adalah tepi citra
                if (this.imageArray[nextY] && this.imageArray[nextY][nextX]) {
                    // Simpan arah ke kode rantai
                    chainCode.push(direction);
                    x = nextX;
                    y = nextY;
                    direction = (direction + 6) % 8; // Berikutnya arah
                    break; // Keluar dari loop
                }

                // Ganti arah ke kiri
                direction = (direction + 1) % 8;
            }
        } while (x !== startX || y !== startY);

        return chainCode;
    }

    async flatten2DArray() {
        return this.imageArray.reduce((flatArray, row) => flatArray.concat(row), []);
    }

    async normalize1DArray(array, min, max) {
        const minValue = Math.min(...array);
        const maxValue = Math.max(...array);

        if (minValue === maxValue) {
            // Handle kasus ketika semua nilai adalah sama (menghindari pembagian oleh nol)
            return array.map((value) => min);
        }

        const normalizedArray = array.map((value) => {
            return min + (max - min) * (value - minValue) / (maxValue - minValue);
        });

        return normalizedArray;
    }

    async getFeatureOcr() {
        var dataFeatureLBP = await this.calculateLBP();
        var dataFeatureFlat = await this.flatten2DArray();
        var dataFeatureHog = await this.calculateHoG(6, 4, 9);

        var normalizeArrayLBP = await this.normalize1DArray(dataFeatureLBP, 0, 1);
        var normalizeArrayFlat = await this.normalize1DArray(dataFeatureFlat, 0, 1);
        var normalizeArrayHog = await this.normalize1DArray(dataFeatureHog, 0, 1);

        var normalizeArray = normalizeArrayLBP.concat(normalizeArrayFlat);
        var normalizeArray = normalizeArray.concat(normalizeArrayHog);
        return normalizeArray;
    }
}

function calculateGradient(imageArray) {
    const height = imageArray.length;
    const width = imageArray[0].length;

    const gradientX = new Array(height);
    const gradientY = new Array(height);

    for (let i = 0; i < height; i++) {
        gradientX[i] = new Array(width).fill(0);
        gradientY[i] = new Array(width).fill(0);
    }

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const pixelXGradient = imageArray[y - 1][x - 1] + 2 * imageArray[y][x - 1] + imageArray[y + 1][x - 1] -
                (imageArray[y - 1][x + 1] + 2 * imageArray[y][x + 1] + imageArray[y + 1][x + 1]);

            const pixelYGradient = imageArray[y - 1][x - 1] + 2 * imageArray[y - 1][x] + imageArray[y - 1][x + 1] -
                (imageArray[y + 1][x - 1] + 2 * imageArray[y + 1][x] + imageArray[y + 1][x + 1]);

            gradientX[y][x] = pixelXGradient;
            gradientY[y][x] = pixelYGradient;
        }
    }

    return { gradientX, gradientY };
}

function calculateMagnitude(gradient) {
    const { gradientX, gradientY } = gradient;
    const height = gradientX.length;
    const width = gradientX[0].length;

    const magnitude = new Array(height);

    for (let i = 0; i < height; i++) {
        magnitude[i] = new Array(width).fill(0);
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            magnitude[y][x] = Math.sqrt(gradientX[y][x] ** 2 + gradientY[y][x] ** 2);
        }
    }

    return magnitude;
}

function calculateOrientation(gradient) {
    const { gradientX, gradientY } = gradient;
    const height = gradientX.length;
    const width = gradientX[0].length;

    const orientation = new Array(height);

    for (let i = 0; i < height; i++) {
        orientation[i] = new Array(width).fill(0);
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            orientation[y][x] = (Math.atan2(gradientY[y][x], gradientX[y][x]) * 180 / Math.PI + 180) % 360;
        }
    }

    return orientation;
}