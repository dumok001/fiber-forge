import {ColorCountMap, HexColor, ImageData, RGB, YarnColorMatch, YarnColorRegion, YarnColorsData} from "../types";

export function hexToRgb(_hex: HexColor): RGB {
	let hex: string = _hex.replace(/^#/, '');
	if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
	const num = parseInt(hex, 16);
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function logWithHexColor(text: string, hex: HexColor) {
	const [r, g, b] = hexToRgb(hex);
	// eslint-disable-next-line no-console
	console.log(`\x1b[38;2;0;0;0m\x1b[48;2;${r};${g};${b}m%s\x1b[0m`, text);
}

export function quantize(value: number, step = 85): number {
	return Math.round(value / step) * step;
}

export async function getAverageColor(yarnImageData: ImageData, {
	x0,
	y0,
	x1,
	y1
}: YarnColorRegion): Promise<HexColor> | never {
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
	if (count === 0) throw new Error(`No valid pixels found in the specified region. It might be too light or transparent.`);
	const rAvg = Math.round(rSum / count);
	const gAvg = Math.round(gSum / count);
	const bAvg = Math.round(bSum / count);
	return `#${[rAvg, gAvg, bAvg].map(x => x.toString(16).padStart(2, '0')).join('')}` as HexColor;
}

export function mergeSimilarColors(colors: HexColor[], colorCountMap: ColorCountMap, threshold: number = 40) {
	const groups: Array<{ representative: HexColor, count: number }> = [];
	const colorToRgb = (color: HexColor) => color.match(/\w\w/g)!.map(x => parseInt(x, 16));
	
	colors.forEach(color => {
		const rgb = colorToRgb(color);
		let bestGroup = groups.find(group => {
			const dist = colorToRgb(group.representative).reduce((sum, val, i) => sum + (val - rgb[i]) ** 2, 0);
			return Math.sqrt(dist) < threshold;
		});
		
		if (bestGroup) {
			bestGroup.count += colorCountMap.get(color) || 1;
		} else {
			groups.push({representative: color, count: colorCountMap.get(color) || 1});
		}
	});
	
	return groups.map(g => ({color: g.representative, count: g.count}));
}

export function getClosestColors(color: HexColor, yarnColorsObj: YarnColorsData): YarnColorMatch[] {
	const colorRgb: RGB = hexToRgb(color);
	const distances: YarnColorMatch[] = Object.entries(yarnColorsObj).map(([file, yarnHex]) => {
		const yarnRgb = hexToRgb(yarnHex);
		const dist = Math.sqrt(
			colorRgb.reduce((sum, c, i) => sum + (c - yarnRgb[i]) ** 2, 0)
		);
		return {file, color: yarnHex, dist};
	});
	
	return distances
		.sort((a, b) => a.dist - b.dist)
}