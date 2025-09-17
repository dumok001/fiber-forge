import {HexColor, HSL, RGB, RGBA} from "color";

/**
 * Converts hexadecimal color to RGB values
 *
 * @param _hex - Hexadecimal color string (e.g., '#FF0000' or '#F00')
 * @returns RGB tuple with red, green, blue values (0-255)
 *
 * @example
 * ```typescript
 * const rgb = hexToRgb('#FF0000');
 * console.log(rgb); // [255, 0, 0]
 *
 * const rgb2 = hexToRgb('#F00');
 * console.log(rgb2); // [255, 0, 0] (3-digit hex expanded)
 * ```
 */
export function hexToRgb(_hex: HexColor): RGB {
	let hex: string = _hex.replace(/^#/, '');
	if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
	const num = parseInt(hex, 16);
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Converts RGB or RGBA values to hexadecimal color string
 *
 * @param rgb - RGB or RGBA tuple (alpha channel is ignored if present)
 * @returns Hexadecimal color string
 *
 * @example
 * ```typescript
 * const hex = rgbToHex([255, 0, 0]);
 * console.log(hex); // '#FF0000'
 *
 * const hex2 = rgbToHex([255, 0, 0, 128]); // alpha ignored
 * console.log(hex2); // '#FF0000'
 * ```
 */
export function rgbToHex(rgb: RGB | RGBA): HexColor {
	const [r, g, b] = rgb;
	const toHex = (n: number) => {
		const hex = Math.round(n).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};
	
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts RGB or RGBA values to HSV (Hue, Saturation, Value) color space
 *
 * @param rgb - RGB or RGBA tuple (alpha channel is ignored if present)
 * @returns HSL tuple with hue (0-360), saturation (0-1), value (0-1)
 *
 * @example
 * ```typescript
 * const hsv = rgbToHsv([255, 0, 0]);
 * console.log(hsv); // [0, 1, 1] (pure red)
 *
 * const hsv2 = rgbToHsv([128, 128, 128]);
 * console.log(hsv2); // [0, 0, 0.5] (gray)
 * ```
 */
export function rgbToHsv(rgb: RGB | RGBA): HSL {
	let [r, g, b] = rgb.map(v => v / 255);
	
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const diff = max - min;
	
	let h = 0;
	if (diff !== 0) {
		if (max === r) h = ((g - b) / diff) % 6;
		else if (max === g) h = (b - r) / diff + 2;
		else h = (r - g) / diff + 4;
	}
	h = Math.round(h * 60);
	if (h < 0) h += 360;
	
	const s = max === 0 ? 0 : diff / max;
	const v = max;
	
	return [h, s, v];
}
