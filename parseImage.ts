import sharp = require('sharp');
import {hexToRgb, logWithHexColor, quantize} from './utils/colors';
import {HexColor, YarnColorsData} from './types';
import {getClosestYarnColors} from "./utils/getClosestYarnColors";

export default async function getNonTransparentArea(imagePath: string) {
	const image = sharp(imagePath);
	const {width, height, channels} = await image.metadata();
	const {data} = await image.raw().toBuffer({resolveWithObject: true});
	
	let nonTransparentPixels = 0;
	const colorSet = new Set<HexColor>();
	const colorCountMap = new Map<HexColor, number>();
	
	for (let i = 0; i < data.length; i += channels) {
		const [r, g, b, a = 255] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
		if (a > 0) {
			nonTransparentPixels++;
			const hex = `#${[r, g, b].map(x => quantize(x).toString(16).padStart(2, '0')).join('')}` as HexColor;
			colorSet.add(hex);
			colorCountMap.set(hex, (colorCountMap.get(hex) || 0) + 1);
		}
	}
	
	const mergeSimilarColors = (colors: HexColor[], threshold = 40) => {
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
	};
	
	const mergedColors = mergeSimilarColors(Array.from(colorSet));
	const colorPercentages = mergedColors.map(({color, count}) => ({
		color,
		colorRgb: hexToRgb(color).join(','),
		percentage: parseFloat(((count / nonTransparentPixels) * 100).toFixed(2))
	})).filter(x => x.percentage > 0.001);
	
	const yarnColorsObj: YarnColorsData = require('../yarnColors.json');
	const uniqueColorsWithMatches = colorPercentages.map(({color, percentage, colorRgb}) => ({
		color,
		percentage,
		colorRgb,
		matches: getClosestYarnColors(color, yarnColorsObj, 5)
	})).sort((a, b) => b.percentage - a.percentage);
	
	uniqueColorsWithMatches.forEach(({color, matches, colorRgb}) => {
		logWithHexColor(`color: ${colorRgb}`, color);
		matches.forEach(match => logWithHexColor(`${match.file}: ${match.color}`, match.color));
	});
	
	const {widthCm, heightCm, areaCm} = getSquare({width, height, nonTransparentPixels});
	
	return {
		widthPx: width,
		heightPx: height,
		nonTransparentAreaPx: nonTransparentPixels,
		widthCm,
		heightCm,
		nonTransparentAreaCm: areaCm,
		uniqueColors: colorPercentages,
	};
}

function getSquare({width, height, nonTransparentPixels}, pixelInCm = 5) {
	return {
		widthCm: width / pixelInCm,
		heightCm: height / pixelInCm,
		areaCm: nonTransparentPixels / (pixelInCm * pixelInCm),
	};
}