import {YarnColorsData} from "../types";
import FiberForge from "../index";
import {logWithHexColor} from "./utils/logs";

const test = async () => {
	const fiberForge = new FiberForge({platform: 'server'});
	const yarnColorsData: YarnColorsData = require('../tmp/yarnColors.json');
	const imagePath = '../sketch/test2.png';
	const threshold = 30;
	fiberForge.yarns = yarnColorsData
	
	const stats = await fiberForge.parseImage({
		threshold,
		imagePath,
		maxCountYarns: 3,
		maxWidthCm: 30
	});
	stats.forEach((item) => {
		console.log(`Color: ${item.color}, Area: ${item.areaInCm.toFixed(2)} cm², Percentage: ${item.percentage.toFixed(2)}%`);
		logWithHexColor('Sample ', item.color);
		logWithHexColor('yarn sample1', item.yarns[0]?.color);
		logWithHexColor('yarn sample3', item.yarns[2]?.color);
		console.log('Closest Yarns:', item.yarns);
	})
}
test()