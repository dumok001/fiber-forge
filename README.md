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

```typescript
// Add individual yarn colors
fiberForge.addYarn('#FF5733', 'yarn-red-001.jpg');

// Or set multiple yarns at once
fiberForge.yarns = {
	'yarn-red-001.jpg': '#FF5733',
	'yarn-blue-002.jpg': '#3366FF',
	'yarn-green-003.jpg': '#33FF66'
};
```

### Parse Yarn Colors from Images

```typescript
const yarnColor = await fiberForge.parseYarn(
	'./path/to/yarn.jpg',
	{x0: 10, y0: 10, x1: 100, y1: 100} // region coordinates
);
```

## API Reference

### Constructor

```typescript
new FiberForge(options)
```

#### Options

- `platform?: 'server' | 'browser'` - Target platform (default: 'server')

### Methods

#### `parseImage(options: ParseImageOptions): Promise<ParseImage[]>`

Analyzes an image and returns color regions with area calculations and yarn matches.

**Parameters:**

- `imagePath: string` - Path to the image file
- `threshold?: number` - Color similarity threshold (0-100, default: 25)
- `maxCountYarns?: number` - Maximum number of yarn matches per color (default: 5)
- `maxWidthCm: number` OR `maxHeightCm: number` - Physical dimensions for area calculation

**Returns:** Array of color regions with:

- `color: HexColor` - Average color of the region
- `imagePart: ImagePart` - Base64 image and coordinates
- `pixelCount: number` - Number of pixels in the region
- `areaInCm: number` - Area in square centimeters
- `percentage: number` - Percentage of total non-transparent area
- `yarns: YarnColorMatch[]` - Matching yarn colors

#### `parseYarn(yarnPath: string, region: YarnColorRegion): Promise<HexColor>`

Extracts the average color from a specific region of a yarn image.

**Parameters:**

- `yarnPath: string` - Path to the yarn image
- `region: YarnColorRegion` - Region coordinates `{x0, y0, x1, y1}`

**Returns:** Hex color string

#### `addYarn(color: HexColor, fileName: string): void`

Adds a yarn color to the database.

### Properties

#### `yarns: YarnColorsData`

Setter for bulk yarn color data.

## Examples

### Color Analysis with Area Calculation

```typescript
import FiberForge from 'fiberforge';

const fiberForge = new FiberForge({platform: 'server'});

const results = await fiberForge.parseImage({
	imagePath: './design.jpg',
	maxWidthCm: 25,
	threshold: 20,
	maxCountYarns: 3
});

results.forEach((region, index) => {
	console.log(`Region ${index + 1}:`);
	console.log(`Color: ${region.color}`);
	console.log(`Area: ${region.areaInCm.toFixed(2)} cm²`);
	console.log(`Percentage: ${region.percentage.toFixed(1)}%`);
	console.log(`Recommended yarns:`, region.yarns.slice(0, 3));
	console.log('---');
});
```

### Browser Usage

```typescript
import FiberForge from 'fiberforge';

const fiberForge = new FiberForge({platform: 'browser'});

// In browser, you can use file URLs or data URLs
const results = await fiberForge.parseImage({
	imagePath: fileURL,
	maxHeightCm: 15,
	threshold: 10
});
```

## Technical Details

### Color Similarity Algorithm

The library uses advanced color similarity algorithms that consider:

- RGB color distance in 3D space
- Adaptive thresholds based on color characteristics
- Transparent pixel handling
- Area-based filtering

### Performance Optimizations

- Efficient flood-fill algorithm for color region detection
- Memory-optimized pixel processing
- Stack overflow prevention for large images
- Configurable area thresholds

### Platform Support

**Server (Node.js):**

- Uses Sharp library for image processing
- Full file system access
- Optimized for batch processing

**Browser:**

- Uses Canvas API for image processing
- Works with File API and drag-and-drop
- CORS-friendly for web applications

## Project Structure

```
├── index.ts              # Main FiberForge class
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
│   ├── colorConversion.ts    # Color space conversions
│   ├── colors.ts            # Color analysis functions
│   ├── imageData.ts         # Image loading utilities
│   ├── processImageColors.ts # Core image processing
│   ├── validation.ts        # Input validation
│   └── errorMessages.ts     # Centralized error messages
└── test/                 # Test files and configurations
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run in development mode
npm run dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### v1.0.0

- Initial release
- Universal browser/server support
- Advanced color analysis algorithms
- Yarn matching system
- Area calculation in cm²
- TypeScript support

## Support

If you encounter any issues or have questions, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include code examples and error messages

## Acknowledgments

- Built with TypeScript for type safety
- Uses Sharp for server-side image processing
- Canvas API for browser-side processing
- Optimized algorithms for performance

---

Made with ❤️ for the textile and craft community
