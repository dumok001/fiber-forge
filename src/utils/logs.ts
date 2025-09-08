import {HexColor} from "../../types";
import {hexToRgb} from "../../utils/colorConversion";

export function logWithHexColor(text: string, hex: HexColor) {
	const [r, g, b] = hexToRgb(hex);
	// eslint-disable-next-line no-console
	console.log(`\x1b[38;2;0;0;0m\x1b[48;2;${r};${g};${b}m%s\x1b[0m`, text);
}