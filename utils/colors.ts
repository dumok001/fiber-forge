import {HexColor, RGB} from "color";
import {YarnColorRegion} from "yarn";
import sharp from "sharp";

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

export async function getAverageColor(filePath: string, {x0, y0, x1, y1}: YarnColorRegion): Promise<HexColor | null> {
	const image = sharp(filePath);
	const metadata = await image.metadata();
	const {width, height, channels} = metadata;
	const {data} = await image.raw().toBuffer({resolveWithObject: true});
	
	
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
	if (count === 0) return null;
	const rAvg = Math.round(rSum / count);
	const gAvg = Math.round(gSum / count);
	const bAvg = Math.round(bSum / count);
	return `#${[rAvg, gAvg, bAvg].map(x => x.toString(16).padStart(2, '0')).join('')}` as HexColor;
}