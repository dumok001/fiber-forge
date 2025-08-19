import sharp, {Sharp} from "sharp";
import fs from 'fs';
import path from 'path';
import {HexColor} from "color";

import {FileStore} from "./store/store";

const yarnsDir = path.join(__dirname, 'yarns');

async function getAverageColor(image: Sharp): Promise<HexColor | null> {
	const metadata = await image.metadata();
	const {width, height, channels} = metadata;
	const {data} = await image.raw().toBuffer({resolveWithObject: true});
	
	const squareSize = Math.floor(width * 0.3);
	const x0 = Math.floor((width - squareSize) / 2);
	const y0 = Math.floor(height * 0.3);
	const yLimit = Math.floor(height / 3);
	
	let rSum = 0, gSum = 0, bSum = 0, count = 0;
	for (let y = y0; y < y0 + squareSize && y < height && y < yLimit; y++) {
		for (let x = x0; x < x0 + squareSize && x < width; x++) {
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
			const color = await getAverageColor(image);
			
			
			if (color === null) {
				console.warn(`No valid color found in ${file}. It might be too light or transparent.`);
				continue;
			}
			
			result[file] = color;
			console.log(`${file}: ${color}`);
			
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


processYarnImages(fs.readdirSync(yarnsDir)).then(async result => {
	const _path = '/tmp'
	const output = 'yarnColors.json'
	
	await FileStore.ensureFileExists(output, _path).catch(err => {
		console.error(`Error ensuring file exists: ${err.message}`);
		process.exit(1);
	})
	
	const store = new FileStore(output, _path);
	await store.setItems(result)
	console.log('Result saved to yarnColors.json');
});