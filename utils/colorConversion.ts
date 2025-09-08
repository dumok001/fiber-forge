import {HexColor, HSL, RGB, RGBA} from "color";

export function hexToRgb(_hex: HexColor): RGB {
	let hex: string = _hex.replace(/^#/, '');
	if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
	const num = parseInt(hex, 16);
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(rgb: RGB | RGBA): HexColor {
	const [r, g, b] = rgb;
	const toHex = (n: number) => {
		const hex = Math.round(n).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};
	
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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
