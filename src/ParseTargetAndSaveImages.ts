import fs from 'fs/promises';
import path from 'path';
import FiberForge from '../index';
import {processImageColors} from "../utils/processImageColors";
import {getTestImagePaths, getTestOutputDir, getTestThreshold, TestImagePaths} from "./utils/config";
import {loadTestConfig} from "./utils/envLoader";

async function parseTargetAndSaveImages() {
	// Load test configuration from environment file
	loadTestConfig();
	let testImages: TestImagePaths, tmpDir: string, threshold: number;
	
	try {
		// Get configuration from environment variables with validation
		testImages = getTestImagePaths();
		tmpDir = path.resolve(getTestOutputDir());
		threshold = getTestThreshold();
		
		console.log('Test configuration:');
		console.log('- Images:', testImages);
		console.log('- Output directory:', tmpDir);
		console.log('- Threshold:', threshold);
		
		// Remove all files in output folder before running test
		await fs.rm(tmpDir, {recursive: true, force: true});
		await fs.mkdir(tmpDir, {recursive: true});
	} catch (err) {
		console.error('Configuration error:', err);
		process.exit(1);
	}
	
	try {
		const fiberForge = new FiberForge({platform: 'server'});
		const imageData = await (fiberForge as any).getImageData(testImages.third);
		
		// Function is now asynchronous
		const results = await processImageColors({imageData, threshold});
		
		console.log('Number of results:', results.length);
		for (let i = 0; i < results.length; i++) {
			console.log(`Result ${i + 1}:`, results[i])
			const {imagePart, color, pixelCount} = results[i];
			console.log(`imagePart.base64[${i}]:`, imagePart.base64 ? imagePart.base64.slice(0, 30) : 'empty');
			if (!imagePart.base64) continue;
			const base64 = imagePart.base64.replace(/^data:image\/png;base64,/, '');
			const filePath = path.resolve(tmpDir, `target_color_${i + 1}_${color}_${Math.round(pixelCount)}.png`);
			try {
				await fs.writeFile(filePath, base64, 'base64');
				console.log('File saved:', filePath);
			} catch (err) {
				console.error('Error writing file:', filePath, err);
			}
		}
		console.log(`Saved ${results.length} PNG files from ${path.basename(testImages.first)} in ${tmpDir} folder.`);
	} catch (err) {
		console.error('Error processing images:', err);
		process.exit(1);
	}
}

parseTargetAndSaveImages().catch((err) => {
	console.error('Error saving files:', err);
});
