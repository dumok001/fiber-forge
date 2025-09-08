import {isValidImagePath, isValidThreshold} from "../../utils/validation";

export interface TestImagePaths {
	first: string;
	second: string;
	third: string;
}

export function getTestImagePaths(): TestImagePaths {
	const firstImage = process.env.TEST_IMAGE_FIRST
	const secondImage = process.env.TEST_IMAGE_SECOND
	const thirdImage = process.env.TEST_IMAGE_THIRD
	
	if (!firstImage || !secondImage || !thirdImage) {
		throw new Error('Missing one or more test image environment variables: TEST_IMAGE_FIRST, TEST_IMAGE_SECOND, TEST_IMAGE_THIRD');
	}
	
	// Validate image paths
	if (!isValidImagePath(firstImage)) {
		throw new Error(`Invalid first test image path: ${firstImage}. Must be a valid image file.`);
	}
	
	if (!isValidImagePath(secondImage)) {
		throw new Error(`Invalid second test image path: ${secondImage}. Must be a valid image file.`);
	}
	
	if (!isValidImagePath(thirdImage)) {
		throw new Error(`Invalid third test image path: ${thirdImage}. Must be a valid image file.`);
	}
	
	return {
		first: firstImage,
		second: secondImage,
		third: thirdImage
	};
}

export function getTestOutputDir(): string {
	if (!process.env.TEST_OUTPUT_DIR) {
		throw new Error('Missing TEST_OUTPUT_DIR environment variable');
	}
	return process.env.TEST_OUTPUT_DIR;
}


export function getTestThreshold(): number {
	const thresholdStr = process.env.TEST_THRESHOLD || '15';
	const threshold = parseInt(thresholdStr, 10);
	
	if (!isValidThreshold(threshold)) {
		throw new Error(`Invalid threshold value: ${thresholdStr}. Must be an integer between 0 and 100.`);
	}
	
	return threshold;
}
