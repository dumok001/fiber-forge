import {HexColor, ImageData, ProcessImageColorsResult, RGBA} from "../types";
import {isColorSimilarHex, isTransparentPixel} from "./colors";
import {rgbToHex} from "./colorConversion";
import {createPngBase64} from "./image";
import {isValidThreshold} from "./validation";
import {ERROR_MESSAGES} from "./errorMessages";

interface ProcessImageColorsData {
	imageData: ImageData;
	threshold: number;
	minimalSquarePixelArea?: number
}


const minValThreshold = 0;
const maxValThreshold = 100;


export function processImageColors(functionData: ProcessImageColorsData): Promise<ProcessImageColorsResult[]> {
	const {
		imageData,
		threshold,
		minimalSquarePixelArea = 200
	} = functionData;
	
	if (!isValidThreshold(threshold, minValThreshold, maxValThreshold)) {
		throw new Error(ERROR_MESSAGES.THRESHOLD_INVALID_RANGE(minValThreshold, maxValThreshold));
	}
	
	const {width, height, channels, data} = imageData;
	const processed = new Uint8Array(width * height); // 0 - not processed, 1 - processed
	const results: ProcessImageColorsResult[] = [];
	
	function getPixel(x: number, y: number): RGBA {
		const idx = (y * width + x) * channels;
		return [
			data[idx],
			data[idx + 1],
			data[idx + 2],
			channels === 4 ? data[idx + 3] : 255
		];
	}
	
	function setProcessed(x: number, y: number) {
		processed[y * width + x] = 1;
	}
	
	function isProcessed(x: number, y: number) {
		return processed[y * width + x] === 1;
	}
	
	function calculateAverageColor(pixels: Array<{ x: number, y: number }>): HexColor {
		let r = 0, g = 0, b = 0;
		for (const pixel of pixels) {
			const [pr, pg, pb] = getPixel(pixel.x, pixel.y);
			r += pr;
			g += pg;
			b += pb;
		}
		const count = pixels.length;
		return rgbToHex([Math.round(r / count), Math.round(g / count), Math.round(b / count)]);
	}
	
	async function findSimilarArea(startX: number, startY: number): Promise<ProcessImageColorsResult | null> {
		const targetPixel = getPixel(startX, startY);
		
		if (isTransparentPixel(targetPixel)) return null; // Ignore transparent pixels
		
		const tempArea: Array<{ x: number, y: number }> = [];
		const queue: Array<{ x: number, y: number }> = [];
		let averageColor = rgbToHex(targetPixel);
		let lastTripleSize = 0;
		
		// Track area boundaries
		let minX = startX, maxX = startX, minY = startY, maxY = startY;
		
		// Use Set to track visited pixels in current area
		const visited = new Set<string>();
		const key = (x: number, y: number) => `${x},${y}`;
		
		// Add starting pixel
		queue.push({x: startX, y: startY});
		visited.add(key(startX, startY));
		setProcessed(startX, startY);
		
		// Limit iterations to prevent infinite loops
		let iterationCount = 0;
		const maxIterations = width * height; // Maximum possible number of pixels
		
		while (queue.length > 0 && iterationCount < maxIterations) {
			iterationCount++;
			const current = queue.shift()!;
			
			// Check that current pixel is still valid
			if (isTransparentPixel(getPixel(current.x, current.y))) continue;
			
			// Add current pixel to area
			tempArea.push(current);
			
			// Update area boundaries
			minX = Math.min(minX, current.x);
			maxX = Math.max(maxX, current.x);
			minY = Math.min(minY, current.y);
			maxY = Math.max(maxY, current.y);
			
			if (tempArea.length >= lastTripleSize * 3 && lastTripleSize > 0) {
				averageColor = calculateAverageColor(tempArea);
				lastTripleSize = tempArea.length;
			} else if (lastTripleSize === 0) {
				lastTripleSize = 1;
			}
			
			// Check neighboring pixels (4-connectivity)
			const neighbors = [
				{x: current.x - 1, y: current.y},
				{x: current.x + 1, y: current.y},
				{x: current.x, y: current.y - 1},
				{x: current.x, y: current.y + 1}
			];
			
			for (const neighbor of neighbors) {
				const {x: nx, y: ny} = neighbor;
				const neighborKey = key(nx, ny);
				
				// Check boundaries
				if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
				
				// Check if already processed globally
				if (isProcessed(nx, ny)) continue;
				
				// Check if already visited in current area
				if (visited.has(neighborKey)) continue;
				
				const targetPixel = getPixel(nx, ny);
				
				// Transparent pixels block spreading
				if (isTransparentPixel(targetPixel)) {
					setProcessed(nx, ny);
					continue;
				}
				
				const neighborColor = rgbToHex(targetPixel);
				
				// Check similarity with averaged area color
				if (isColorSimilarHex(averageColor, neighborColor, threshold)) {
					// Mark as visited and processed BEFORE adding to queue
					visited.add(neighborKey);
					setProcessed(nx, ny);
					queue.push({x: nx, y: ny});
				} else {
					// Mark as processed if color doesn't match
					setProcessed(nx, ny);
				}
			}
		}
		
		// If iteration limit reached, show warning
		if (iterationCount >= maxIterations) {
			console.warn(`Iteration limit reached (${maxIterations}) for area starting at (${startX}, ${startY})`);
		}
		
		if (tempArea.length === 0) return null;
		
		// Filter pixels to ensure no transparent pixels
		const filteredArea = tempArea.filter(({x, y}) => {
			const [, , , a] = getPixel(x, y);
			return a > 10;
		});
		
		if (filteredArea.length === 0) return null;
		
		// Recalculate area boundaries based on filtered pixels
		const allX = filteredArea.map(p => p.x);
		const allY = filteredArea.map(p => p.y);
		const filteredMinX = allX.reduce((min, x) => Math.min(min, x), allX[0]);
		const filteredMaxX = allX.reduce((max, x) => Math.max(max, x), allX[0]);
		const filteredMinY = allY.reduce((min, y) => Math.min(min, y), allY[0]);
		const filteredMaxY = allY.reduce((max, y) => Math.max(max, y), allY[0]);
		
		// Final average color based on filtered pixels
		const finalAverageColor = calculateAverageColor(filteredArea);
		const pixelCount = filteredArea.length;
		
		// Create base64Image only for area with opaque pixels
		const base64Image = await createBase64Image(filteredArea, filteredMinX, filteredMinY, filteredMaxX, filteredMaxY);
		
		// Calculate margins as free space from edges to area
		const areaWidth = filteredMaxX - filteredMinX + 1;
		const areaHeight = filteredMaxY - filteredMinY + 1;
		
		return {
			color: finalAverageColor,
			imagePart: {
				base64: base64Image,
				marginX: filteredMinX,
				marginY: filteredMinY,
				marginXPercent: (filteredMinX / width) * 100,
				marginYPercent: (filteredMinY / height) * 100,
				widthPercent: (areaWidth / width) * 100,
				heightPercent: (areaHeight / height) * 100
			},
			pixelCount,
			pixels: filteredArea // Save only opaque pixels
		};
	}
	
	async function createBase64Image(pixels: Array<{
		x: number,
		y: number
	}>, minX: number, minY: number, maxX: number, maxY: number): Promise<string> {
		const areaWidth = maxX - minX + 1;
		const areaHeight = maxY - minY + 1;
		const tempData = new Uint8ClampedArray(areaWidth * areaHeight * 4);
		
		// Fill with transparent background
		for (let i = 0; i < tempData.length; i += 4) {
			tempData[i] = 255;     // R
			tempData[i + 1] = 255; // G
			tempData[i + 2] = 255; // B
			tempData[i + 3] = 0;   // A (transparent)
		}
		
		// Fill only area pixels
		for (const pixel of pixels) {
			const localX = pixel.x - minX;
			const localY = pixel.y - minY;
			const idx = (localY * areaWidth + localX) * 4;
			const [r, g, b, a] = getPixel(pixel.x, pixel.y);
			tempData[idx] = r;
			tempData[idx + 1] = g;
			tempData[idx + 2] = b;
			tempData[idx + 3] = a;
		}
		
		try {
			return await createPngBase64(tempData, areaWidth, areaHeight);
		} catch (e) {
			console.error('PNG creation error:', e);
			return '';
		}
	}
	
	// Main asynchronous function for image processing
	return new Promise(async (resolve, reject) => {
		try {
			// Main processing loop: left to right, top to bottom
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					// Skip already processed pixels
					if (isProcessed(x, y)) continue;
					
					// Ignore transparent pixels
					if (isTransparentPixel(getPixel(x, y))) continue;
					
					// Find area of similar pixels (only 1 tempArea at a time)
					const area = await findSimilarArea(x, y);
					if (area) {
						results.push(area);
					}
				}
			}
			
			const filteredResults = results
				.filter(area => area.pixelCount >= minimalSquarePixelArea)
				.map(({pixels, ...area}) => area);
			
			resolve(filteredResults);
		} catch (error) {
			reject(error);
		}
	});
}
