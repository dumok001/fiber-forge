import {HexColor} from "color";

export interface ImageData {
	width: number;
	height: number;
	channels: number;
	data: Uint8Array;
}

interface ImagePart {
	base64: string;
	marginX: number
	marginY: number;
}

export interface ProcessImageColorsResult {
	color: HexColor;
	imagePart: ImagePart;
	pixelCount: number;
	pixels?: Array<{ x: number, y: number }>;
}