export interface ColorMatch {
	file: string;
	color: string;
	distance?: number;
}

export interface ColorGroup {
	colors: string[];
	representative: string;
	count: number;
}

export interface ColorPercentage {
	color: string;
	colorRgb: string;
	percentage: number;
}

export interface ColorWithMatches extends ColorPercentage {
	matches: ColorMatch[];
}

export type RGB = [number, number, number];

export type HexColor = `#${string}`;
