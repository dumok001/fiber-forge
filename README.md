# FiberForge

A TypeScript library for advanced image color analysis and yarn matching for textile and craft projects.

## Overview

FiberForge is a powerful image processing library that analyzes images to extract color regions, calculate areas, and
match colors with yarn databases. It's designed for textile designers, crafters, and anyone working with color-based
image analysis.

## Features

- 🎨 **Advanced Color Analysis**: Extract and analyze color regions from images
- 📐 **Area Calculation**: Calculate areas in both pixels and centimeters
- 🧶 **Yarn Matching**: Match image colors with yarn color databases
- 🌐 **Universal Support**: Works in both browser and Node.js environments
- 🖼️ **Image Export**: Generate base64 PNG images of color regions
- ⚡ **Performance Optimized**: Efficient algorithms for large image processing
- 🔧 **TypeScript**: Fully typed for better development experience

## Installation

```bash
npm install fiberforge
```

## Quick Start

### Basic Usage

```typescript
import FiberForge from 'fiberforge';

// Initialize FiberForge
const fiberForge = new FiberForge({
	platform: 'server' // or 'browser'
});

// Analyze an image
const results = await fiberForge.parseImage({
	imagePath: './path/to/image.jpg',
	maxWidthCm: 30, // or maxHeightCm: 20
	threshold: 15,
	maxCountYarns: 5
});

console.log(results);
```

### Adding Yarn Colors

You can add yarn colors to match against image colors:

```typescript
// Add individual yarn colors
fiberForge.addYarn('#FF5733', 'Red Wool');
fiberForge.addYarn('#33FF57', 'Green Cotton');

// Or set multiple yarns at once
fiberForge.yarns = {
	'Red Wool': '#FF5733',
	'Green Cotton': '#33FF57',
	'Blue Silk': '#3357FF'
};
```

### Parse Yarn Color from Image

Extract the average color from a specific region of a yarn image:

```typescript
const yarnColor = await fiberForge.parseYarn('./yarn-image.jpg', {
	x0: 10,
	y0: 10,
	x1: 100,
	y1: 100
});

console.log('Yarn color:', yarnColor); // #A5B2C3
```

## API Reference

### Constructor

```typescript
new FiberForge(options
:
FiberForgeOptions
)
```

#### Options

- `platform` (optional): `'server' | 'browser'` - Platform where the library runs (default: `'server'`)

### Methods

#### `parseImage(options: ParseImageOptions): Promise<ParseImageResult[]>`

Analyzes an image and returns color regions with their properties.

##### Parameters

- `imagePath`: string - Path to the image file
- `maxWidthCm` OR `maxHeightCm`: number - Physical dimensions for area calculation
- `threshold` (optional): number - Color similarity threshold (0-100, default: 25)
- `maxCountYarns` (optional): number - Maximum number of yarn matches per color (default: 5)
- `minimalSquarePixelArea` (optional): number - Minimum pixel area for color regions (default: 200)

##### Returns

Array of `ParseImageResult` objects containing:

```typescript
interface ParseImageResult {
	color: HexColor;           // Dominant color in hex format
	pixelCount: number;        // Number of pixels in this color region
	areaInCm: number;         // Area in square centimeters
	percentage: number;        // Percentage of total image area
	yarns: YarnColorMatch[];   // Matching yarn colors
	imageBase64: string;       // Base64 PNG image of the color region
}
```

#### `parseYarn(yarnPath: string, region: YarnColorRegion): Promise<HexColor>`

Extracts average color from a specific region of a yarn image.

##### Parameters

- `yarnPath`: string - Path to the yarn image
- `region`: YarnColorRegion - Region coordinates

```typescript
interface YarnColorRegion {
	x0: number; // Left coordinate
	y0: number; // Top coordinate
	x1: number; // Right coordinate
	y1: number; // Bottom coordinate
}
```

#### `addYarn(color: HexColor, name: string): void`

Adds a single yarn color to the database.

##### Parameters

- `color`: HexColor - Color in hex format (e.g., '#FF5733')
- `name`: string - Yarn name identifier

#### `set yarns(yarns: YarnColorsData): void`

Sets the yarn color database.

##### Parameters

- `yarns`: YarnColorsData - Object mapping yarn names to hex colors

```typescript
interface YarnColorsData {
	[yarnName: string]: HexColor;
}
```

## Types

### Core Types

```typescript
type HexColor = string; // e.g., '#FF5733'
type Platform = 'server' | 'browser';

interface YarnColorMatch {
	yarn: string;     // Yarn name
	color: HexColor;  // Yarn color
	dist: number;     // Color distance (lower = better match)
}

interface ImageData {
	width: number;
	height: number;
	channels: number; // 3 for RGB, 4 for RGBA
	data: Uint8Array; // Raw pixel data
}
```

## Examples

### Complete Example: Analyzing a Craft Project

```typescript
import FiberForge from 'fiberforge';

async function analyzeCraftProject() {
	// Initialize FiberForge
	const fiberForge = new FiberForge({platform: 'server'});
	
	// Set yarn database
	fiberForge.yarns = {
		'Red Merino': '#C41E3A',
		'Forest Green': '#228B22',
		'Sky Blue': '#87CEEB',
		'Cream White': '#F5F5DC',
		'Charcoal': '#36454F'
	};
	
	// Analyze the image
	const results = await fiberForge.parseImage({
		imagePath: './craft-pattern.jpg',
		maxWidthCm: 25,
		threshold: 20,
		maxCountYarns: 3,
		minimalSquarePixelArea: 150
	});
	
	// Process results
	for (const region of results) {
		console.log(`Color: ${region.color}`);
		console.log(`Area: ${region.areaInCm.toFixed(2)} cm²`);
		console.log(`Percentage: ${region.percentage.toFixed(1)}%`);
		console.log('Best yarn matches:');
		
		region.yarns.forEach((yarn, index) => {
			console.log(`  ${index + 1}. ${yarn.yarn} (${yarn.color}) - Distance: ${yarn.dist.toFixed(2)}`);
		});
		
		console.log('---');
	}
}

analyzeCraftProject().catch(console.error);
```

### Building a Yarn Color Database

```typescript
import FiberForge from 'fiberforge';

async function buildYarnDatabase() {
	const fiberForge = new FiberForge({platform: 'server'});
	
	// Extract colors from yarn sample images
	const yarnSamples = [
		{name: 'Red Wool', path: './yarns/red-wool.jpg'},
		{name: 'Blue Cotton', path: './yarns/blue-cotton.jpg'},
		{name: 'Green Silk', path: './yarns/green-silk.jpg'}
	];
	
	const yarnColors: { [name: string]: string } = {};
	
	for (const sample of yarnSamples) {
		// Define region to sample (center of image)
		const region = {x0: 50, y0: 50, x1: 150, y1: 150};
		
		const color = await fiberForge.parseYarn(sample.path, region);
		yarnColors[sample.name] = color;
		
		console.log(`${sample.name}: ${color}`);
	}
	
	// Use the extracted colors
	fiberForge.yarns = yarnColors;
	
	return yarnColors;
}
```

### Browser Usage

```typescript
// For browser environments
const fiberForge = new FiberForge({platform: 'browser'});

// You'll need to convert File/Blob to appropriate format
// or use canvas to get ImageData
```

## Error Handling

The library provides descriptive error messages for common issues:

```typescript
try {
	const results = await fiberForge.parseImage({
		imagePath: './non-existent.jpg',
		maxWidthCm: 30
	});
} catch (error) {
	console.error('Analysis failed:', error.message);
	// Handle specific errors like file not found, invalid dimensions, etc.
}
```

## Performance Considerations

- **Image Size**: Larger images take more time to process. Consider resizing very large images.
- **Threshold**: Lower threshold values result in more detailed analysis but slower processing.
- **Minimal Area**: Higher `minimalSquarePixelArea` values filter out small regions and improve performance.
- **Yarn Database**: Larger yarn databases increase matching time but provide better results.

## Platform Support

- **Node.js**: Full support with file system access
- **Browser**: Supported with appropriate image data handling
- **TypeScript**: Full type definitions included

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes to this project.
