export function isValidThreshold(value: number, minThreshold = 0, maxThreshold = 100): boolean {
	return Number.isInteger(value) && value >= minThreshold && value <= maxThreshold;
}

export function isValidImagePath(path: string): boolean {
	if (path.trim().length === 0) {
		return false;
	}
	const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
	const lowercasePath = path.toLowerCase();
	
	return validExtensions.some(ext => lowercasePath.endsWith(ext));
}
