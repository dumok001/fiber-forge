export interface ColorMatch {
	file: string;
	color: string;
	distance?: number;
}

export type ColorCountMap = Map<HexColor, number>

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
