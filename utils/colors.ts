import {HexColor, ImageData, RGB, RGBA, YarnColorMatch, YarnColorRegion, YarnColorsData} from "../types";
import {hexToRgb} from "./colorConversion";
import {ERROR_MESSAGES} from "./errorMessages";


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

export function isTransparentPixel([, , , a]: RGBA, alphaThreshold: number = 10): boolean {
	return a <= alphaThreshold;
}