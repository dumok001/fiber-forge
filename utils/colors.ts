import {HexColor, RGB} from "color";

export function hexToRgb(_hex: HexColor): RGB {
	let hex:string = _hex.replace(/^#/, '');
	if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
	const num = parseInt(hex, 16);
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function logWithHexColor(text: string, hex:HexColor) {
	const [r, g, b] = hexToRgb(hex);
	console.log(`\x1b[38;2;0;0;0m\x1b[48;2;${r};${g};${b}m%s\x1b[0m`, text);
}
export  function quantize(value: number, step = 85):number {
	return Math.round(value / step) * step;
}