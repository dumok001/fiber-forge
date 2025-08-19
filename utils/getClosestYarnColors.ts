import {hexToRgb} from './colors'
import {HexColor, RGB, YarnColorMatch, YarnColorsData} from "index";

export function getClosestYarnColors(color: HexColor, yarnColorsObj: YarnColorsData, count = 5): YarnColorMatch[] {
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
		.slice(0, count)
}