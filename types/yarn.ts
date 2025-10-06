import {HexColor} from "color";

/**
 * Represents a yarn identifier that can be either a string name or numeric ID
 *
 * @example
 * ```typescript
 * // String-based yarn names
 * const yarnName1: YarnColorName = 'Red Wool';
 * const yarnName2: YarnColorName = 'Blue Cotton #45';
 *
 * // Numeric yarn IDs
 * const yarnId1: YarnColorName = 123;
 * const yarnId2: YarnColorName = 4567;
 */
export type YarnColorName = string;

/**
 * Database of yarn colors mapping yarn names to their hex colors
 *
 * @example
 * ```typescript
 * const yarns: YarnColorsData = {
 *   'Red Wool': '#FF0000',
 *   'Blue Cotton': '#0000FF',
 *   'Green Silk': '#00FF00'
 * };
 * ```
 */
export interface YarnColorsData {
	[key: YarnColorName]: HexColor;
}

/**
 * Represents a yarn color match with similarity distance
 */
export interface YarnColorMatch {
	/** Name of the yarn */
	yarn: YarnColorName;
	/** Hex color code of the yarn */
	color: HexColor;
	/** Distance/similarity score (lower values indicate better matches) */
	dist: number;
}

/**
 * Defines a rectangular region within an image for color analysis
 *
 * @example
 * ```typescript
 * const region: YarnColorRegion = {
 *   x0: 10,  // left edge
 *   y0: 20,  // top edge
 *   x1: 100, // right edge
 *   y1: 150  // bottom edge
 * };
 * ```
 */
export interface YarnColorRegion {
	/** Left coordinate (x-axis start) */
	x0: number;
	/** Top coordinate (y-axis start) */
	y0: number;
	/** Right coordinate (x-axis end) */
	x1: number;
	/** Bottom coordinate (y-axis end) */
	y1: number
}