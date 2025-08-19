export function getSquare({width, height, nonTransparentPixels}, pixelInCm = 5) {
	return {
		widthCm: width / pixelInCm,
		heightCm: height / pixelInCm,
		areaCm: nonTransparentPixels / (pixelInCm * pixelInCm),
	};
}