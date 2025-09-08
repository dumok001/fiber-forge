import {
	HexColor,
	ImageData,
	Platform,
	ProcessImageColorsResult,
	YarnColorMatch,
	YarnColorRegion,
	YarnColorsData
} from "./types";
import {getAverageColor, getClosestColors} from "./utils/colors";
import {processImageColors} from "./utils/processImageColors";
import {getImageData} from "./utils/imageData";
import {ERROR_MESSAGES} from "./utils/errorMessages";

// Re-export types for convenience
export * from './types';

type FiberForgeOptions = {
	platform?: Platform;
}

type ParseImageOptionsRequired = {
	threshold?: number,
	imagePath: string;
	maxCountYarns?: number;
	minimalSquarePixelArea?: number;
}

type ParseImageOptions =
	| ParseImageOptionsRequired & { maxWidthCm: number; maxHeightCm?: never }
	| ParseImageOptionsRequired & { maxWidthCm?: never; maxHeightCm: number };

interface ParseImage extends ProcessImageColorsResult {
	areaInCm: number,
	percentage: number
	yarns: YarnColorMatch[] | []
}


class FiberForge {
	private readonly platform: Platform = 'server'
	private readonly threshold: number = 25;
	private yarnColorsData: YarnColorsData | undefined;
	
	
	constructor({platform}: FiberForgeOptions) {
		if (platform)
			this.platform = platform
	}
	
	set yarns(yarns: YarnColorsData) {
		this.yarnColorsData = yarns;
	}
	
	addYarn(color: HexColor, fileName: string) {
		if (!this.yarnColorsData) {
			this.yarnColorsData = {};
		}
		this.yarnColorsData[fileName] = color
	}
	
	
	async parseImage(parseImageData: ParseImageOptions): Promise<ParseImage[]> {
		const {imagePath, threshold: _threshold, minimalSquarePixelArea: _minimalSquarePixelArea} = parseImageData;
		const threshold = _threshold ?? this.threshold;
		const maxCountYarns = parseImageData.maxCountYarns ?? 5;
		const minimalSquarePixelArea = _minimalSquarePixelArea ?? 200;
		
		
		const imageData = await this.getImageData(imagePath);
		let pixelInCm = this.getPixelInCm(parseImageData, imageData);
		
		
		const parsedImageData = await processImageColors({
			imageData,
			threshold,
			minimalSquarePixelArea
		});
		
		const nonTransparentPixels = parsedImageData.reduce((sum, r) => sum + r.pixelCount, 0);
		const result: ParseImage[] = parsedImageData.map((item): ParseImage => {
			const {pixelCount} = item;
			const areaInCm = pixelCount / (pixelInCm ** 2);
			const percentage = (pixelCount / nonTransparentPixels) * 100;
			let yarns: YarnColorMatch[] = [];
			if (this.yarnColorsData)
				yarns = getClosestColors(item.color, this.yarnColorsData).slice(0, maxCountYarns);
			
			return {
				...item,
				areaInCm,
				percentage,
				yarns
			}
		})
		
		return result;
	}
	
	async parseYarn(yarnPath: string, yarnColorRegion: YarnColorRegion) {
		const yarnImageData = await this.getImageData(yarnPath);
		return getAverageColor(yarnImageData, yarnColorRegion);
	}
	
	private getPixelInCm(parseImageData: ParseImageOptions, imageData: ImageData) {
		const {width, height} = imageData;
		
		if (parseImageData.maxWidthCm) {
			return width / parseImageData.maxWidthCm;
		} else if (parseImageData.maxHeightCm) {
			return height / parseImageData.maxHeightCm;
		} else {
			throw new Error(ERROR_MESSAGES.DIMENSIONS_MISSING);
		}
	}
	
	private async getImageData(imagePath: string): Promise<ImageData> {
		return getImageData(imagePath, this.platform);
	}
	
}

export default FiberForge;