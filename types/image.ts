import {ColorPercentage} from 'color';

export interface ImageAnalysisResult {
	widthPx: number;
	heightPx: number;
	nonTransparentAreaPx: number;
	widthCm: number;
	heightCm: number;
	nonTransparentAreaCm: number;
	uniqueColors: ColorPercentage[];
}

export interface ImageMetadata {
	width: number;
	height: number;
	channels: number;
}

export interface ImageData {
	width: number;
	height: number;
	channels: number;
	data: Uint8Array;
}
