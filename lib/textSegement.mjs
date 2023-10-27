import cv from '@u4/opencv4nodejs';

export class TextSegmentation {
  constructor(imagePath) {
    this.imagePath = imagePath;
  }

  async segmentText() {
    const image = cv.imreadAsync(this.imagePath);
    const grayImage = image.cvtColor(cv.COLOR_BGR2GRAY);
    const binaryImage = grayImage.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

    const contours = binaryImage.findContours();
    const segmentedCharacters = [];

    for (const contour of contours) {
      const boundingRect = contour.boundingRect();
      const aspectRatio = boundingRect.width / boundingRect.height;

      // Filter out small or non-text regions
      if (boundingRect.width > 10 && boundingRect.height > 10 && aspectRatio >= 0.5) {
        const characterImage = binaryImage.getRegion(boundingRect);
        segmentedCharacters.push(characterImage);
      }
    }

    return segmentedCharacters;
  }

  async saveSegmentedCharacters(outputDirectory) {
    const segmentedCharacters = await this.segmentText();
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    segmentedCharacters.forEach((character, index) => {
      const outputPath = `${outputDirectory}/char_${index}.jpg`;
      cv.imwrite(outputPath, character);
    });
  }
}