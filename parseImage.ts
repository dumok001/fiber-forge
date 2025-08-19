import { getClosestYarnColors } from './findMatches';

import sharp = require('sharp');
import {hexToRgb, logWithHexColor, quantize} from './utils/colors';
import {YarnColorsData, HexColor} from "./types";

export default async function getNonTransparentArea(imagePath: string) {
	const image = sharp(imagePath);
	const metadata = await image.metadata();
	const { width, height, channels } = metadata;
	
	const { data } = await image.raw().toBuffer({ resolveWithObject: true });
	
	let nonTransparentPixels = 0;
	const colorSet = new Set<HexColor>();
	const colorCountMap = new Map<HexColor, number>();
	
	
	for (let i = 0; i < data.length; i += channels) {
		let r = quantize(data[i]);
		let g = quantize(data[i + 1]);
		let b = quantize(data[i + 2]);
		let a = channels === 4 ? data[i + 3] : 255;
		if (a > 0) {
			nonTransparentPixels++;
			const hex = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}` as HexColor;
			colorSet.add(hex);
			colorCountMap.set(hex, (colorCountMap.get(hex) || 0) + 1);
		}
	}
	
	function mergeSimilarColorsWithCount(colors: HexColor[], threshold = 40) {
		const groups: Array<{colors: HexColor[], representative: HexColor, count: number}> = [];
		const colorToRgb = (color: HexColor) => color.match(/\w\w/g)!.map(x => parseInt(x, 16));
		
		for (const color of colors) {
			const rgb = colorToRgb(color);
			let bestGroup: {colors: HexColor[], representative: HexColor, count: number} | null = null;
			let minDist = Infinity;
			
			for (const group of groups) {
				const groupRgb = colorToRgb(group.representative);
				const dist = Math.sqrt(
					(rgb[0] - groupRgb[0]) ** 2 +
					(rgb[1] - groupRgb[1]) ** 2 +
					(rgb[2] - groupRgb[2]) ** 2
				);
				if (dist < threshold && dist < minDist) {
					minDist = dist;
					bestGroup = group;
				}
			}
			
			if (bestGroup) {
				bestGroup.colors.push(color);
				bestGroup.count += colorCountMap.get(color) || 1;
				// Update representative as weighted average
				const total = bestGroup.count;
				const prevRgb = colorToRgb(bestGroup.representative).map(x => x * (total - (colorCountMap.get(color) || 1)));
				const newRgb = [
					Math.round((prevRgb[0] + rgb[0] * (colorCountMap.get(color) || 1)) / total),
					Math.round((prevRgb[1] + rgb[1] * (colorCountMap.get(color) || 1)) / total),
					Math.round((prevRgb[2] + rgb[2] * (colorCountMap.get(color) || 1)) / total)
				];
				bestGroup.representative = `#${newRgb.map(x => x.toString(16).padStart(2, '0')).join('')}` as HexColor;
			} else {
				groups.push({
					colors: [color],
					representative: color,
					count: colorCountMap.get(color) || 1
				});
			}
		}
		
		return groups.map(g => ({
			color: g.representative,
			count: g.count
		}));
	}
	
	Array.from(colorSet).forEach((color: HexColor) => {
		const colorRgb = hexToRgb(color).join(',');
		logWithHexColor(`color: ${colorRgb}`, color);
	})
	const mergedColorsWithCount = mergeSimilarColorsWithCount(Array.from(colorSet), 0);
	
	const colorPercentages = mergedColorsWithCount.map(({ color, count }) => ({
		color: color as HexColor,
		colorRgb: hexToRgb(color as HexColor).join(','),
		percentage: parseFloat(((count / nonTransparentPixels) * 100).toFixed(2))
	})).filter(x => x.percentage > 0.001);
	
	
	// Example usage inside your function:
	const yarnColorsObj:YarnColorsData = require('../yarnColors.json');
	const uniqueColorsWithMatches = colorPercentages.map(({ color, percentage, colorRgb }) => ({
		color,
		percentage,
		colorRgb,
		matches: getClosestYarnColors(color, yarnColorsObj, 5)
	})).sort((a, b) => b.percentage - a.percentage);
	
	console.log(uniqueColorsWithMatches);
	
	uniqueColorsWithMatches.forEach(({ color, percentage, matches, colorRgb }) => {
		console.group(`Color: ${color} (${percentage}%)`);
		logWithHexColor(`color: ${colorRgb}`, color);
		console.log(`percentage: ${percentage};`);
		console.group('matches:');
		matches.forEach(match => {
			logWithHexColor(`${match.file}: ${match.color}`, match.color);
		});
		console.groupEnd();
		console.groupEnd();
	})
	
	
	const widthCm = width / 5;
	const heightCm = height / 5;
	const areaCm = nonTransparentPixels / 25;
	
	return {
		widthPx: width,
		heightPx: height,
		nonTransparentAreaPx: nonTransparentPixels,
		widthCm,
		heightCm,
		nonTransparentAreaCm: areaCm,
		uniqueColors: colorPercentages,
		// uniqueColorsCount: mergedColors.size
	};
}