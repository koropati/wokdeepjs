
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