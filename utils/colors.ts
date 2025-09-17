import {HexColor, ImageData, RGB, RGBA, YarnColorMatch, YarnColorRegion, YarnColorsData} from "../types";
import {hexToRgb} from "./colorConversion";
import {ERROR_MESSAGES} from "./errorMessages";

/**
 * Calculates the average color from a specified region of an image
 *
 * @param yarnImageData - Raw image data containing pixel information
 * @param yarnColorRegion - Region coordinates to analyze
 * @param yarnColorRegion.x0 - Left boundary of the region
 * @param yarnColorRegion.y0 - Top boundary of the region
 * @param yarnColorRegion.x1 - Right boundary of the region
 * @param yarnColorRegion.y1 - Bottom boundary of the region
 * @returns Promise resolving to hex color representing the average color
 * @throws {Error} When no valid pixels are found in the region
 *
 * @example
 * ```typescript
 * const imageData = await getImageData('./yarn.jpg');
 * const region = { x0: 10, y0: 10, x1: 100, y1: 100 };
 * const avgColor = await getAverageColor(imageData, region);
 * console.log(avgColor); // '#A5B2C3'
 * ```
 */
export async function getAverageColor(yarnImageData: ImageData, yarnColorRegion: YarnColorRegion): Promise<HexColor> | never {
	const {x0, y0, x1, y1} = yarnColorRegion
	const {width, height, channels, data} = yarnImageData;
	
	
	let rSum = 0, gSum = 0, bSum = 0, count = 0;
	for (let y = y0; y < y1 && y < height; y++) {
		for (let x = x0; x < x1 && x < width; x++) {
			const idx = (y * width + x) * channels;
			const r = data[idx];
			const g = data[idx + 1];
			const b = data[idx + 2];
			const a = channels === 4 ? data[idx + 3] : 255;
			// Ignore almost-white pixels (tolerance: 245)
			if (
				a > 0 &&
				!(r > 245 && g > 245 && b > 245)
			) {
				rSum += r;
				gSum += g;
				bSum += b;
				count++;
			}
		}
	}
	if (count === 0) throw new Error(ERROR_MESSAGES.NO_VALID_PIXELS);
	const rAvg = Math.round(rSum / count);
	const gAvg = Math.round(gSum / count);
	const bAvg = Math.round(bSum / count);
	return `#${[rAvg, gAvg, bAvg].map(x => x.toString(16).padStart(2, '0')).join('')}` as HexColor;
}

/**
 * Finds the closest matching yarn colors for a given color
 *
 * @param color - Target hex color to match against
 * @param yarnColorsObj - Database of available yarn colors
 * @returns Array of yarn color matches sorted by similarity (closest first)
 *
 * @example
 * ```typescript
 * const yarns = {
 *   'Red Wool': '#FF0000',
 *   'Blue Cotton': '#0000FF'
 * };
 * const matches = getClosestColors('#FF3333', yarns);
 * console.log(matches[0].yarn); // 'Red Wool' (closest match)
 * ```
 */
export function getClosestColors(color: HexColor, yarnColorsObj: YarnColorsData): YarnColorMatch[] {
	const colorRgb: RGB = hexToRgb(color);
	const distances: YarnColorMatch[] = Object.entries(yarnColorsObj).map(([yarnName, yarnHex]) => {
		const yarnRgb = hexToRgb(yarnHex);
		const dist = Math.sqrt(
			colorRgb.reduce((sum, c, i) => sum + (c - yarnRgb[i]) ** 2, 0)
		);
		return {yarn: yarnName, color: yarnHex, dist};
	});
	
	return distances
		.sort((a, b) => a.dist - b.dist)
}

/**
 * Determines if two hex colors are similar within a specified threshold
 *
 * @param c1 - First hex color to compare
 * @param c2 - Second hex color to compare
 * @param thresholdPercent - Similarity threshold as percentage (0-100)
 * @returns True if colors are similar within threshold, false otherwise
 * @throws {Error} When threshold percentage is outside valid range (0-100)
 *
 * @example
 * ```typescript
 * const similar = isColorSimilarHex('#FF0000', '#FF3333', 15);
 * console.log(similar); // true (colors are within 15% similarity)
 *
 * const different = isColorSimilarHex('#FF0000', '#0000FF', 15);
 * console.log(different); // false (colors are too different)
 * ```
 */
export function isColorSimilarHex(c1: HexColor, c2: HexColor, thresholdPercent: number): boolean {
	if (thresholdPercent < 0 || thresholdPercent > 100) {
		throw new Error(ERROR_MESSAGES.THRESHOLD_PERCENT_INVALID);
	}
	const [red1, green1, blue1] = hexToRgb(c1);
	const [red2, green2, blue2] = hexToRgb(c2);
	const maxDistance = Math.sqrt(255 ** 2 + 255 ** 2 + 255 ** 2); // ≈ 441
	const distance = Math.sqrt(
		(red1 - red2) ** 2 +
		(green1 - green2) ** 2 +
		(blue1 - blue2) ** 2
	);
	const threshold = (thresholdPercent / 100) * maxDistance;
	return distance <= threshold;
}

/**
 * Checks if a pixel is transparent based on its alpha value
 *
 * @param rgba - RGBA color values where alpha is the 4th element
 * @param alphaThreshold - Alpha threshold value (default: 10)
 * @returns True if pixel is considered transparent, false otherwise
 *
 * @example
 * ```typescript
 * const transparentPixel: RGBA = [255, 0, 0, 5];
 * const opaquePixel: RGBA = [255, 0, 0, 255];
 *
 * console.log(isTransparentPixel(transparentPixel)); // true
 * console.log(isTransparentPixel(opaquePixel)); // false
 * ```
 */
export function isTransparentPixel([, , , a]: RGBA, alphaThreshold: number = 10): boolean {
	return a <= alphaThreshold;
}