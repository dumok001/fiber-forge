import sharp from "sharp";
import fs from 'fs';
import path from 'path';
import {HexColor} from "color";

import {FileStore} from "./store/store";
import {logWithHexColor} from './utils/colors';
import {YarnColorRegion} from "yarn";


const yarnsDir = path.join(__dirname, 'yarns');

async function getAverageColor(filePath: string, {x0, y0, x1, y1}: YarnColorRegion): Promise<HexColor | null> {
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


export async function processYarnImages(files: string[]): Promise<Record<string, HexColor>> | never {
	if (!files || files.length === 0) {
		throw new Error('No files specified');
	}
	const result: Record<string, HexColor> = {};
	
	for (const file of files) {
		const filePath = path.join(yarnsDir, file);
		try {
			const image = sharp(filePath);
			const {width, height} = await image.metadata();
			const x0 = Math.floor(width / 2) - Math.floor(width * 0.1);
			const x1 = Math.floor(width / 2) + Math.floor(width * 0.1);
			const y0 = Math.floor(height * 0.2);
			const y1 = Math.floor(height * 0.35);
			
			const color = await getAverageColor(filePath, {x0, y0, x1, y1});
			
			
			if (color === null) {
				console.warn(`No valid color found in ${file}. It might be too light or transparent.`);
				continue;
			}
			logWithHexColor(file, color)
			result[file] = color;
			
		} catch (e) {
			if (e instanceof Error) {
				console.error(`Error processing ${file}:`, e.message);
			} else {
				console.error(`Error processing ${file}:`, e);
			}
		}
	}
	return result;
}


processYarnImages(
	fs.readdirSync(yarnsDir)
		.filter(f => /\.(png|jpg|jpeg|webp|tiff|bmp|gif)$/i.test(f) && !f.startsWith('.'))
).then(async result => {
	const _path = '/tmp'
	const output = 'yarnColors.json'
	
	await FileStore.ensureFileExists(output, _path).catch(err => {
		console.error(`Error ensuring file exists: ${err.message}`);
		process.exit(1);
	})
	
	const store = new FileStore(output, _path);
	await store.setItems(result)
});