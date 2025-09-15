import {HexColor} from "color";
import type {YarnColorMatch} from "./yarn";

export interface ImageData {
	width: number;
	height: number;
	channels: number;
	data: Uint8Array;
}

interface ImagePart {
	base64: string;
	marginX: number;
	marginY: number;
	marginXPercent: number;
	marginYPercent: number;
	widthPercent: number;
	heightPercent: number;
}

export interface ProcessImageColorsResult {
	color: HexColor;
	imagePart: ImagePart;
	pixelCount: number;
	pixels?: Array<{ x: number, y: number }>;
}

export interface ParseImageResult extends ProcessImageColorsResult {
	areaInCm: number;
	percentage: number;
	yarns: YarnColorMatch[];
}
