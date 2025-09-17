import {HexColor} from "color";
import type {YarnColorMatch} from "./yarn";

/**
 * Raw image data structure containing pixel information
 */
export interface ImageData {
	/** Width of the image in pixels */
	width: number;
	/** Height of the image in pixels */
	height: number;
	/** Number of color channels (3 for RGB, 4 for RGBA) */
	channels: number;
	/** Raw pixel data as byte array */
	data: Uint8Array;
}

/**
 * Represents a part/region of an image with positioning information
 */
interface ImagePart {
	/** Base64 encoded PNG image data */
	base64: string;
	/** Horizontal margin in pixels from left edge */
	marginX: number;
	/** Vertical margin in pixels from top edge */
	marginY: number;
	/** Horizontal margin as percentage of total image width */
	marginXPercent: number;
	/** Vertical margin as percentage of total image height */
	marginYPercent: number;
	/** Width as percentage of total image width */
	widthPercent: number;
	/** Height as percentage of total image height */
	heightPercent: number;
}

/**
 * Result from processing image colors, containing color region data
 */
export interface ProcessImageColorsResult {
	/** Dominant hex color of the region */
	color: HexColor;
	/** Image part containing this color region */
	imagePart: ImagePart;
	/** Number of pixels in this color region */
	pixelCount: number;
	/** Optional array of individual pixel coordinates */
	pixels?: Array<{ x: number, y: number }>;
}

/**
 * Extended result with additional analysis data for parsed images
 */
export interface ParseImageResult extends ProcessImageColorsResult {
	/** Area of the color region in square centimeters */
	areaInCm: number;
	/** Percentage of total image area this region represents */
	percentage: number;
	/** Array of matching yarn colors sorted by similarity */
	yarns: YarnColorMatch[];
}
