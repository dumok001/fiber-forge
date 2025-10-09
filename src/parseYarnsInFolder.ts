import sharp from "sharp";
import fs from 'fs';
import path from 'path';
import {HexColor} from "color";
import {getAverageColor} from '../utils/colors';
import FiberForge from "../index";
import {ERROR_MESSAGES} from "../utils/errorMessages";

const yarnsDir = path.join(__dirname, '../yarns');

export async function processYarnImages(files: string[]): Promise<Record<string, HexColor>> | never {
	if (!files || files.length === 0) {
		throw new Error(ERROR_MESSAGES.NO_FILE_SPECIFIED);
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
			const fiberForge = new FiberForge({platform: 'server'});
			const imageData = await (fiberForge as any).getImageData(filePath);
			const color = await getAverageColor(imageData, {x0, y0, x1, y1});
			
			
			if (color === null) {
				console.warn(`No valid color found in ${file}. It might be too light or transparent.`);
				continue;
			}
			result[file] = color;
			
		} catch (e) {
			const message = ERROR_MESSAGES.PROCESSING_FILE(file);
			if (e instanceof Error) {
				console.error(message, e.message);
			} else {
				console.error(message, e);
			}
		}
	}
	return result;
}


processYarnImages(
	fs.readdirSync(yarnsDir)
		.filter(f => /\.(png|jpg|jpeg|webp|tiff|bmp|gif)$/i.test(f) && !f.startsWith('.'))
).then(async result => {
	const _path = '../tmp'
	const output = 'yarnColors3.json'
	
	fs.writeFileSync(path.join(_path, output), JSON.stringify(result, null, 2));
});