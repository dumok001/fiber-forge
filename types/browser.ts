// Browser-specific types for Node.js environment compatibility
export interface BrowserImageElement {
	width: number;
	height: number;
	src: string;
	crossOrigin: string | null;
	onload: (() => void) | null;
	onerror: (() => void) | null;
}

export interface BrowserCanvasElement {
	width: number;
	height: number;
	
	getContext(contextId: '2d'): BrowserCanvasRenderingContext2D | null;
}

export interface BrowserCanvasRenderingContext2D {
	drawImage(image: BrowserImageElement, dx: number, dy: number): void;
	
	getImageData(sx: number, sy: number, sw: number, sh: number): BrowserImageData;
}

export interface BrowserImageData {
	data: Uint8ClampedArray;
	width: number;
	height: number;
}


