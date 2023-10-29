
export function normalizeArray2D(arr) {
    if (!Array.isArray(arr) || arr.length === 0 || !Array.isArray(arr[0])) {
        throw new Error('Invalid array format. Expected a 2D array.');
    }

    // Temukan nilai minimum dan maksimum dalam array
    let min = arr[0][0];
    let max = arr[0][0];

    for (let row of arr) {
        for (let value of row) {
            if (value < min) {
                min = value;
            }
            if (value > max) {
                max = value;
            }
        }
    }

    // Normalisasi nilai-nilai dalam array
    const normalizedArray = [];

    for (let row of arr) {
        const normalizedRow = [];
        for (let value of row) {
            const normalizedValue = (value - min) / (max - min);
            normalizedRow.push(normalizedValue);
        }
        normalizedArray.push(normalizedRow);
    }

    return normalizedArray;
}

export function invertBinaryArray2D(arr) {
    if (!Array.isArray(arr) || arr.length === 0 || !Array.isArray(arr[0])) {
        throw new Error('Invalid array format. Expected a 2D array.');
    }

    const invertedArray = [];

    for (let row of arr) {
        const invertedRow = [];
        for (let value of row) {
            // Inversi nilai biner (0 menjadi 1 dan sebaliknya)
            const invertedValue = value === 0 ? 1 : 0;
            invertedRow.push(invertedValue);
        }
        invertedArray.push(invertedRow);
    }

    return invertedArray;
}

export function findNearestTopLeft(arr, valueToFind) {
    if (!Array.isArray(arr) || arr.length === 0 || !Array.isArray(arr[0])) {
        throw new Error('Invalid array format. Expected a 2D array.');
    }

    let rowIndex = -1;
    let colIndex = -1;

    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] === valueToFind) {
                rowIndex = i;
                colIndex = j;
                break;
            }
        }
        if (rowIndex !== -1) {
            break;
        }
    }

    return { row: rowIndex, col: colIndex };
}

export function findNearestBottomRight(arr, valueToFind) {
    if (!Array.isArray(arr) || arr.length === 0 || !Array.isArray(arr[0])) {
        throw new Error('Invalid array format. Expected a 2D array.');
    }

    let rowIndex = -1;
    let colIndex = -1;

    for (let i = arr.length - 1; i >= 0; i--) {
        for (let j = arr[i].length - 1; j >= 0; j--) {
            if (arr[i][j] === valueToFind) {
                rowIndex = i;
                colIndex = j;
                break;
            }
        }
        if (rowIndex !== -1) {
            break;
        }
    }

    return { row: rowIndex, col: colIndex };
}

export function getSubarray(arr, startRow, startCol, endRow, endCol) {
    if (!Array.isArray(arr) || arr.length === 0 || !Array.isArray(arr[0])) {
        throw new Error('Invalid array format. Expected a 2D array.');
    }

    if (
        startRow < 0 ||
        startCol < 0 ||
        endRow >= arr.length ||
        endCol >= arr[0].length
    ) {
        throw new Error('Invalid start or end indices.');
    }

    const subarray = [];

    for (let i = startRow; i <= endRow; i++) {
        const row = [];
        for (let j = startCol; j <= endCol; j++) {
            row.push(arr[i][j]);
        }
        subarray.push(row);
    }

    return subarray;
}

export function getSubArrayUsingWidthHeight(array, x, y, width, height) {
    const subarray = [];

    for (let i = y; i < y + height; i++) {
        const row = [];
        for (let j = x; j < x + width; j++) {
            row.push(array[i][j]);
        }
        subarray.push(row);
    }

    return subarray;
}

export function textLineSegmentation(binaryArray) {
    if (!Array.isArray(binaryArray) || binaryArray.length === 0 || !Array.isArray(binaryArray[0])) {
        throw new Error('Invalid array format. Expected a 2D binary array.');
    }

    const lines = [];
    let isTextLine = false;
    let currentLine = [];

    for (let row of binaryArray) {
        isTextLine = row.some(value => value === 1);

        if (isTextLine) {
            currentLine.push([...row]);
        } else if (currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = [];
        }
    }

    // Jika ada baris teks terakhir yang belum ditambahkan
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return lines;
}

export function getHigherTextLineSegmentation(binaryArray) {
    if (!Array.isArray(binaryArray) || binaryArray.length === 0 || !Array.isArray(binaryArray[0])) {
        throw new Error('Invalid array format. Expected a 2D binary array.');
    }

    var lines = binaryArray;
    let isTextLine = false;
    let currentLine = [];

    var maxArea = 0;

    for (let row of binaryArray) {
        isTextLine = row.some(value => value === 1);

        if (isTextLine) {
            currentLine.push([...row]);
        } else if (currentLine.length > 0) {
            if(currentLine.length * currentLine[0].length > maxArea) {
                maxArea = currentLine.length * currentLine[0].length;
                lines = currentLine;
            }
            currentLine = [];
        }
    }

    // Jika ada baris teks terakhir yang belum ditambahkan
    if (currentLine.length > 0) {
        if(currentLine.length * currentLine[0].length > maxArea) {
            maxArea = currentLine.length * currentLine[0].length;
            lines = currentLine;
        }
    }

    return lines;
}


export function charColumnSegmentation(binaryArray) {
    if (!Array.isArray(binaryArray) || binaryArray.length === 0 || !Array.isArray(binaryArray[0])) {
        throw new Error('Invalid array format. Expected a 2D binary array.');
    }

    const columns = [];
    let currentColumn = [];

    for (let col = 0; col < binaryArray[0].length; col++) {
        if (binaryArray.some(row => row[col] === 1)) {
            currentColumn.push(binaryArray.map(row => row[col]));
        } else if (currentColumn.length > 0) {
            columns.push(rotateCCW(flipHorizontal(currentColumn)));
            currentColumn = [];
        }
    }

    if (currentColumn.length > 0) {
        columns.push(currentColumn);
    }

    return columns;
}

export function getArrayDimensions(arr) {
    if (!Array.isArray(arr) || arr.length === 0 || !Array.isArray(arr[0])) {
        throw new Error('Invalid array format. Expected a 2D array.');
    }

    const height = arr.length; // Menghitung jumlah baris
    const width = arr[0].length; // Menghitung panjang (lebar) baris pertama

    return { width, height };
}

export function flipVertical(arr) {
    return arr.slice().reverse();
}

// Fungsi flip horizontal
export function flipHorizontal(arr) {
    return arr.map(row => row.slice().reverse());
}


// Fungsi untuk merotasi array dua dimensi searah jarum jam (CW)
export function rotateCW(arr) {
    const rows = arr.length;
    const cols = arr[0].length;
    const rotated = [];

    for (let i = 0; i < cols; i++) {
        rotated.push([]);
        for (let j = rows - 1; j >= 0; j--) {
            rotated[i].push(arr[j][i]);
        }
    }

    return rotated;
}

// Fungsi untuk merotasi array dua dimensi berlawanan arah jarum jam (CCW)
export function rotateCCW(arr) {
    const rows = arr.length;
    const cols = arr[0].length;
    const rotated = [];

    for (let i = cols - 1; i >= 0; i--) {
        rotated.push([]);
        for (let j = 0; j < rows; j++) {
            rotated[cols - 1 - i].push(arr[j][i]);
        }
    }

    return rotated;
}

export function resizeArray2D(imageArray, newWidth, newHeight) {
    const width = imageArray[0].length;
    const height = imageArray.length;
    const xRatio = width / newWidth;
    const yRatio = height / newHeight;
    const resizedArray = [];

    for (let y = 0; y < newHeight; y++) {
        const sourceY = y * yRatio;
        const sourceY1 = Math.floor(sourceY);
        const sourceY2 = Math.min(Math.ceil(sourceY), height - 1);
        const yFraction = sourceY - sourceY1;

        const row = [];

        for (let x = 0; x < newWidth; x++) {
            const sourceX = x * xRatio;
            const sourceX1 = Math.floor(sourceX);
            const sourceX2 = Math.min(Math.ceil(sourceX), width - 1);
            const xFraction = sourceX - sourceX1;

            const topLeft = imageArray[sourceY1][sourceX1];
            const topRight = imageArray[sourceY1][sourceX2];
            const bottomLeft = imageArray[sourceY2][sourceX1];
            const bottomRight = imageArray[sourceY2][sourceX2];

            const topInterpolation = topLeft * (1 - xFraction) + topRight * xFraction;
            const bottomInterpolation = bottomLeft * (1 - xFraction) + bottomRight * xFraction;

            const finalValue = topInterpolation * (1 - yFraction) + bottomInterpolation * yFraction;
            row.push(finalValue);
        }

        resizedArray.push(row);
    }

    return resizedArray;
}

export function erodeBinaryArray(binaryArray, kernel) {
    const rows = binaryArray.length;
    const cols = binaryArray[0].length;
    const kernelSize = kernel.length;
    const halfKernelSize = Math.floor(kernelSize / 2);

    // Buat array baru untuk hasil erosi dengan nilai awal 0.
    const erodedArray = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

    for (let i = halfKernelSize; i < rows - halfKernelSize; i++) {
        for (let j = halfKernelSize; j < cols - halfKernelSize; j++) {
            let erode = true;

            for (let ki = -halfKernelSize; ki <= halfKernelSize; ki++) {
                for (let kj = -halfKernelSize; kj <= halfKernelSize; kj++) {
                    if (kernel[ki + halfKernelSize][kj + halfKernelSize] === 1) {
                        if (binaryArray[i + ki][j + kj] !== 1) {
                            erode = false;
                            break;
                        }
                    }
                }
                if (!erode) {
                    break;
                }
            }

            if (erode) {
                erodedArray[i][j] = 1;
            }
        }
    }

    return erodedArray;
}

export function dilateBinaryArray(binaryArray, kernel) {
    const rows = binaryArray.length;
    const cols = binaryArray[0].length;
    const kernelSize = kernel.length;
    const halfKernelSize = Math.floor(kernelSize / 2);

    // Buat array baru untuk hasil dilasi dengan nilai awal 0.
    const dilatedArray = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

    for (let i = halfKernelSize; i < rows - halfKernelSize; i++) {
        for (let j = halfKernelSize; j < cols - halfKernelSize; j++) {
            if (binaryArray[i][j] === 1) {
                for (let ki = -halfKernelSize; ki <= halfKernelSize; ki++) {
                    for (let kj = -halfKernelSize; kj <= halfKernelSize; kj++) {
                        if (kernel[ki + halfKernelSize][kj + halfKernelSize] === 1) {
                            dilatedArray[i + ki][j + kj] = 1;
                        }
                    }
                }
            }
        }
    }

    return dilatedArray;
}

export function removeExcessBlackArea(imageArray, startX, startY) {
    const height = imageArray.length;
    const width = imageArray[0].length;
    const targetColor = 1; // Warna objek

    function floodFill(x, y) {
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return;
        }

        if (imageArray[y][x] !== targetColor) {
            return;
        }

        imageArray[y][x] = 0; // Ganti warna ke latar belakang

        floodFill(x - 1, y); // Ke kiri
        floodFill(x + 1, y); // Ke kanan
        floodFill(x, y - 1); // Ke atas
        floodFill(x, y + 1); // Ke bawah
    }

    // Mulai flood fill dari titik awal
    if (imageArray[startY][startX] === targetColor) {
        floodFill(startX, startY);
    }

    return imageArray;
}


export function getArrayDimension(arr) {
    let dimension = 0;
    while (Array.isArray(arr)) {
        dimension++;
        arr = arr[0]; // Periksa elemen pertama dalam array
    }
    return dimension;
}


export function normalizeImageArray(array) {
    // Tahap 1: Hitung nilai minimum dan maksimum dalam array.
    const minMaxValues = findMinMaxValues(array);

    // Tahap 2: Normalisasi nilai-nilai dalam array ke rentang 0 hingga 255.
    const normalizedArray = normalizeValues(array, minMaxValues);

    return normalizedArray;
}

export function findMinMaxValues(array) {
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;

    function updateMinMaxValues(value) {
        if (value < minValue) {
            minValue = value;
        }
        if (value > maxValue) {
            maxValue = value;
        }
    }

    // Fungsi rekursif untuk menghitung min/max
    function recursiveMinMax(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
                recursiveMinMax(arr[i]);
            } else {
                updateMinMaxValues(arr[i]);
            }
        }
    }

    recursiveMinMax(array);

    return { min: minValue, max: maxValue };
}

export function normalizeValues(array, minMaxValues) {
    const { min, max } = minMaxValues;

    function normalize(value) {
        return Math.round(((value - min) / (max - min)) * 255);
    }

    function recursiveNormalize(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
                recursiveNormalize(arr[i]);
            } else {
                arr[i] = normalize(arr[i]);
            }
        }
    }

    const normalizedArray = JSON.parse(JSON.stringify(array)); // Clone the array
    recursiveNormalize(normalizedArray);

    return normalizedArray;
}

export function removePaddingArrayBiner(binaryArray) {
    // Temukan batas objek.
    let top = 0;
    let bottom = binaryArray.length - 1;
    let left = binaryArray[0].length - 1;
    let right = 0;

    for (let i = 0; i < binaryArray.length; i++) {
        for (let j = 0; j < binaryArray[i].length; j++) {
            if (binaryArray[i][j] === 1) {
                top = Math.max(top, i);
                bottom = Math.min(bottom, i);
                left = Math.min(left, j);
                right = Math.max(right, j);
            }
        }
    }

    // Buat array tanpa padding.
    const resultArray = [];
    for (let i = bottom; i <= top; i++) {
        const row = [];
        for (let j = left; j <= right; j++) {
            row.push(binaryArray[i][j]);
        }
        resultArray.push(row);
    }

    return resultArray;
}

export function logicalAndArrays(array1, array2) {
    if (array1.length !== array2.length || array1[0].length !== array2[0].length) {
        throw new Error("Ukuran array tidak sesuai. Kedua array harus memiliki dimensi yang sama.");
    }

    const result = [];
    for (let i = 0; i < array1.length; i++) {
        const row = [];
        for (let j = 0; j < array1[i].length; j++) {
            row.push(array1[i][j] && array2[i][j]);
        }
        result.push(row);
    }

    return result;
}

export function logicalOrArrays(array1, array2) {
    if (array1.length !== array2.length || array1[0].length !== array2[0].length) {
        throw new Error("Ukuran array tidak sesuai. Kedua array harus memiliki dimensi yang sama.");
    }

    const result = [];
    for (let i = 0; i < array1.length; i++) {
        const row = [];
        for (let j = 0; j < array1[i].length; j++) {
            row.push(array1[i][j] || array2[i][j]);
        }
        result.push(row);
    }

    return result;
}

export function logicalNotArrays(array1, array2) {
    if (array1.length !== array2.length || array1[0].length !== array2[0].length) {
        throw new Error("Ukuran array tidak sesuai. Kedua array harus memiliki dimensi yang sama.");
    }

    const result = [];
    for (let i = 0; i < array1.length; i++) {
        const row = [];
        for (let j = 0; j < array1[i].length; j++) {
            row.push(!array2[i][j]);
        }
        result.push(row);
    }

    return result;
}


export function logicalXorArrays(array1, array2) {
    if (array1.length !== array2.length || array1[0].length !== array2[0].length) {
        throw new Error("Ukuran array tidak sesuai. Kedua array harus memiliki dimensi yang sama.");
    }

    const result = [];
    for (let i = 0; i < array1.length; i++) {
        const row = [];
        for (let j = 0; j < array1[i].length; j++) {
            row.push((array1[i][j] && !array2[i][j]) || (!array1[i][j] && array2[i][j]));
        }
        result.push(row);
    }

    return result;
}

export function logicalNandArrays(array1, array2) {
    if (array1.length !== array2.length || array1[0].length !== array2[0].length) {
        throw new Error("Ukuran array tidak sesuai. Kedua array harus memiliki dimensi yang sama.");
    }

    const result = [];
    for (let i = 0; i < array1.length; i++) {
        const row = [];
        for (let j = 0; j < array1[i].length; j++) {
            row.push(!(array1[i][j] && array2[i][j]));
        }
        result.push(row);
    }

    return result;
}

export function logicalNorArrays(array1, array2) {
    if (array1.length !== array2.length || array1[0].length !== array2[0].length) {
        throw new Error("Ukuran array tidak sesuai. Kedua array harus memiliki dimensi yang sama.");
    }

    const result = [];
    for (let i = 0; i < array1.length; i++) {
        const row = [];
        for (let j = 0; j < array1[i].length; j++) {
            row.push(!(array1[i][j] || array2[i][j]));
        }
        result.push(row);
    }

    return result;
}

export function logicalXnorArrays(array1, array2) {
    if (array1.length !== array2.length || array1[0].length !== array2[0].length) {
        throw new Error("Ukuran array tidak sesuai. Kedua array harus memiliki dimensi yang sama.");
    }

    const result = [];
    for (let i = 0; i < array1.length; i++) {
        const row = [];
        for (let j = 0; j < array1[i].length; j++) {
            row.push(!(array1[i][j] || array2[i][j]) || (array1[i][j] && array2[i][j]));
        }
        result.push(row);
    }

    return result;
}

export function detectObjects(binaryArray) {
    const objects = [];
    const rows = binaryArray.length;
    const cols = binaryArray[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    function exploreObject(x, y) {
        let minX = cols;
        let minY = rows;
        let maxX = 0;
        let maxY = 0;

        const stack = [{ x, y }];

        while (stack.length > 0) {
            const { x, y } = stack.pop();

            if (x < 0 || x >= cols || y < 0 || y >= rows || visited[y][x] || binaryArray[y][x] === 0) {
                continue;
            }

            visited[y][x] = true;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);

            stack.push({ x: x - 1, y });
            stack.push({ x: x + 1, y });
            stack.push({ x, y: y - 1 });
            stack.push({ x, y: y + 1 });
        }

        if (minX !== maxX && minY !== maxY) {
            const width = maxX - minX + 1;
            const height = maxY - minY + 1;
            objects.push([minX, minY, width, height]);
        }
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (binaryArray[y][x] === 1 && !visited[y][x]) {
                exploreObject(x, y);
            }
        }
    }

    return objects;
}

export function detectHigherObjects(binaryArray) {
    const result = {
        x: 0,
        y: 0,
        w: 0,
        h: 0
    };

    const rows = binaryArray.length;
    const cols = binaryArray[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    var maxArea = 0;

    function exploreObject(x, y) {
        let minX = cols;
        let minY = rows;
        let maxX = 0;
        let maxY = 0;

        const stack = [{ x, y }];

        while (stack.length > 0) {
            const { x, y } = stack.pop();

            if (x < 0 || x >= cols || y < 0 || y >= rows || visited[y][x] || binaryArray[y][x] === 0) {
                continue;
            }

            visited[y][x] = true;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);

            stack.push({ x: x - 1, y });
            stack.push({ x: x + 1, y });
            stack.push({ x, y: y - 1 });
            stack.push({ x, y: y + 1 });
        }

        if (minX !== maxX && minY !== maxY) {
            const width = maxX - minX + 1;
            const height = maxY - minY + 1;

            if ((width * height) > maxArea) {
                maxArea = width * height;
                result.x = minX;
                result.y = minY;
                result.w = width;
                result.h = height;
            }
        }
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (binaryArray[y][x] === 1 && !visited[y][x]) {
                exploreObject(x, y);
            }
        }
    }

    return result;
}

export function convertEdgeToBlack(binaryArray) {
    const rows = binaryArray.length;
    const cols = binaryArray[0].length;

    // Fungsi untuk memeriksa apakah suatu piksel di tepi
    function isEdgePixel(x, y) {
        return x === 0 || x === cols - 1 || y === 0 || y === rows - 1;
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Periksa apakah piksel saat ini di tepi
            if (isEdgePixel(x, y) && binaryArray[y][x] === 1) {
                // Ubah nilai piksel di tepi menjadi 0
                binaryArray[y][x] = 0;
            }
        }
    }

    return binaryArray;
}

export function convertEdgeToBlackWithThickness(binaryArray, thickness) {
    const rows = binaryArray.length;
    const cols = binaryArray[0].length;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (
                x < thickness || x >= cols - thickness || y < thickness || y >= rows - thickness
            ) {
                binaryArray[y][x] = 0;
            }
        }
    }

    return binaryArray;
}