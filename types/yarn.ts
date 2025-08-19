import {HexColor} from "color";

export interface YarnColorsData {
	[key: string]: HexColor;
}

export interface YarnColor {
	name: string;
	hex: HexColor;
	brand?: string;
}
export interface YarnColorMatch {
	file: string;
	color: HexColor;
	dist: number;
}