import {HexColor} from "color";

export interface YarnColorsData {
	[key: string]: HexColor;
}

export interface YarnColorMatch {
	yarn: string;
	color: HexColor;
	dist: number;
}

export interface YarnColorRegion {
	x0: number;
	y0: number;
	x1: number;
	y1: number
}