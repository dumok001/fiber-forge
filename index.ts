import {
	HexColor,
	ImageData,
	ParseImageResult,
	Platform,
	YarnColorMatch,
	YarnColorName,
	YarnColorRegion,
	YarnColorsData
} from "./types/index.js";
import {getAverageColor, getClosestColors} from "./utils/colors.js";
import {processImageColors} from "./utils/processImageColors.js";
import {getImageData} from "./utils/imageData.js";
import {ERROR_MESSAGES} from "./utils/errorMessages.js";
import {isValidYarnsData} from "./utils/validation.js";

// Re-export types for convenience
export * from './types/index.js';

/**
 * Configuration options for FiberForge initialization
 */
type FiberForgeOptions = {
	/** Platform where the library runs ('server' or 'browser') */
	platform?: Platform;
}

/**
 * Required options for image parsing
 */
type ParseImageOptionsRequired = {
	/** Color similarity threshold (0-100) */
	threshold?: number,
	/** Path to the image file */
	imagePath: string;
	/** Maximum number of yarn matches per color */
	maxCountYarns?: number;
	/** Minimum pixel area for color regions */
	minimalSquarePixelArea?: number;
}

/**
 * Image parsing options with either width or height constraint
 */
export type ParseImageOptions =
	| ParseImageOptionsRequired & { maxWidthCm: number; maxHeightCm?: never }
	| ParseImageOptionsRequired & { maxWidthCm?: never; maxHeightCm: number };

/**
 * Main FiberForge class for image color analysis and yarn matching
 *
 * @example
 * ```typescript
 * const fiberForge = new FiberForge({ platform: 'server' });
 * fiberForge.yarns = { 'Red Wool': '#FF0000' };
 * const results = await fiberForge.parseImage({
 *   imagePath: './image.jpg',
 *   maxWidthCm: 30
 * });
 * ```
 */
class FiberForge {
	private readonly platform: Platform = 'server'
	private readonly threshold: number = 25;
	private yarnColorsData: YarnColorsData | undefined;
	
	/**
	 * Creates a new FiberForge instance
	 *
	 * @param options - Configuration options
	 * @param options.platform - Platform where the library runs (default: 'server')
	 */
	constructor({platform}: FiberForgeOptions) {
		if (platform)
			this.platform = platform
	}
	
	/**
	 * Sets the yarn color database for matching
	 *
	 * @param yarns - Object mapping yarn names to hex colors
	 * @throws {Error} When yarn data is invalid
	 *
	 * @example
	 * ```typescript
	 * fiberForge.yarns = {
	 *   'Red Wool': '#FF0000',
	 *   'Blue Cotton': '#0000FF'
	 * };
	 * ```
	 */
	set yarns(yarns: YarnColorsData) {
		if (!isValidYarnsData(yarns)) {
			throw new Error(ERROR_MESSAGES.INVALID_YARNS_DATA);
		}
		this.yarnColorsData = yarns;
	}
	
	/**
	 * Adds a single yarn color to the database
	 *
	 * @param color - Color in hex format (e.g., '#FF0000')
	 * @param yarn
	 *
	 * @example
	 * ```typescript
	 * fiberForge.addYarn('#FF0000', 'Red Wool');
	 * ```
	 */
	addYarn(color: HexColor, yarn: YarnColorName) {
		if (!this.yarnColorsData) {
			this.yarnColorsData = {};
		}
		this.yarnColorsData[yarn] = color
	}
	
	/**
	 * Analyzes an image and returns color regions with their properties
	 *
	 * @param parseImageData - Image parsing configuration
	 * @param parseImageData.imagePath - Path to the image file
	 * @param parseImageData.maxWidthCm - Physical width for area calculation (mutually exclusive with maxHeightCm)
	 * @param parseImageData.maxHeightCm - Physical height for area calculation (mutually exclusive with maxWidthCm)
	 * @param parseImageData.threshold - Color similarity threshold (0-100, default: 25)
	 * @param parseImageData.maxCountYarns - Maximum yarn matches per color (default: 5)
	 * @param parseImageData.minimalSquarePixelArea - Minimum pixel area for regions (default: 200)
	 * @param signal - Optional AbortSignal to cancel the operation
	 * @param onProgress - Optional callback to report progress (0-100)
	 * @returns Promise resolving to array of color regions with analysis data
	 * @throws {Error} When operation is aborted via AbortSignal
	 *
	 * @example
	 * ```typescript
	 * // Basic usage with progress
	 * const results = await fiberForge.parseImage({
	 *   imagePath: './pattern.jpg',
	 *   maxWidthCm: 30,
	 *   threshold: 20,
	 *   maxCountYarns: 3
	 * }, undefined, (progress) => {
	 *   console.log(`Progress: ${progress}%`);
	 * });
	 * ```
	 */
	async parseImage(
		parseImageData: ParseImageOptions,
		signal?: AbortSignal,
		onProgress?: (progress: number) => void
	): Promise<ParseImageResult[]> {
		const {imagePath, threshold: _threshold, minimalSquarePixelArea: _minimalSquarePixelArea} = parseImageData;
		const threshold = _threshold ?? this.threshold;
		const maxCountYarns = parseImageData.maxCountYarns ?? 5;
		const minimalSquarePixelArea = _minimalSquarePixelArea ?? 200;
		
		// Check if operation was aborted before starting
		signal?.throwIfAborted();
		
		// Report initial progress
		onProgress?.(0);
		
		const imageData = await this.getImageData(imagePath);
		
		// Check if operation was aborted after loading image
		signal?.throwIfAborted();
		
		// Report progress after image loading (5% complete)
		onProgress?.(5);
		
		let pixelInCm = this.getPixelInCm(parseImageData, imageData);
		
		// Create a progress wrapper for processImageColors
		const processImageProgress = (progress: number) => {
			// Map processImageColors progress (0-100) to parseImage progress (5-85)
			const mappedProgress = 5 + Math.round((progress / 100) * 80);
			onProgress?.(mappedProgress);
		};
		
		const parsedImageData = await processImageColors({
			imageData,
			threshold,
			minimalSquarePixelArea,
			signal,
			onProgress: processImageProgress,
			platform: this.platform
		});
		
		// Check if operation was aborted after processing colors
		signal?.throwIfAborted();
		
		// Report progress after color processing (85% complete)
		onProgress?.(85);
		
		const nonTransparentPixels = parsedImageData.reduce((sum, r) => sum + r.pixelCount, 0);
		
		// Report progress before yarn matching (90% complete)
		onProgress?.(90);
		
		const result: ParseImageResult[] = parsedImageData.map((item, index): ParseImageResult => {
			// Check abort signal during processing loop for large datasets
			signal?.throwIfAborted();
			
			const {pixelCount} = item;
			const areaInCm = pixelCount / (pixelInCm ** 2);
			const percentage = (pixelCount / nonTransparentPixels) * 100;
			let yarns: YarnColorMatch[] = [];
			if (this.yarnColorsData)
				yarns = getClosestColors(item.color, this.yarnColorsData).slice(0, maxCountYarns);
			
			// Report progress during yarn matching (90-99%)
			if (onProgress && parsedImageData.length > 0) {
				const itemProgress = 90 + Math.round(((index + 1) / parsedImageData.length) * 9);
				onProgress(itemProgress);
			}
			
			return {
				...item,
				areaInCm,
				percentage,
				yarns
			}
		})
		
		// Report completion (100%)
		onProgress?.(100);
		
		return result;
	}
	
	/**
	 * Extracts average color from a specific region of a yarn image
	 *
	 * @param yarnPath - Path to the yarn image
	 * @param yarnColorRegion - Region coordinates to analyze
	 * @param yarnColorRegion.x0 - Left coordinate
	 * @param yarnColorRegion.y0 - Top coordinate
	 * @param yarnColorRegion.x1 - Right coordinate
	 * @param yarnColorRegion.y1 - Bottom coordinate
	 * @returns Promise resolving to hex color of the yarn
	 *
	 * @example
	 * ```typescript
	 * const yarnColor = await fiberForge.parseYarn('./yarn.jpg', {
	 *   x0: 10, y0: 10, x1: 100, y1: 100
	 * });
	 * console.log('Yarn color:', yarnColor); // '#A5B2C3'
	 * ```
	 */
	async parseYarn(yarnPath: string, yarnColorRegion: YarnColorRegion) {
		const yarnImageData = await this.getImageData(yarnPath);
		return getAverageColor(yarnImageData, yarnColorRegion);
	}
	
	/**
	 * Calculates pixels per centimeter based on image dimensions and physical size
	 *
	 * @private
	 * @param parseImageData - Image parsing options containing physical dimensions
	 * @param imageData - Image data with pixel dimensions
	 * @returns Number of pixels per centimeter
	 * @throws {Error} When neither maxWidthCm nor maxHeightCm is provided
	 */
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
	
	/**
	 * Loads image data from file path based on platform
	 *
	 * @private
	 * @param imagePath - Path to the image file
	 * @returns Promise resolving to image data
	 */
	private async getImageData(imagePath: string): Promise<ImageData> {
		return getImageData(imagePath, this.platform);
	}
}

export default FiberForge;