# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Performance optimizations for large images
- Additional yarn color matching algorithms
- Browser-specific optimizations

## [1.0.2] - 2025-10-09

### Added

- **Progress tracking functionality**: Added optional `onProgress` callback parameter to `parseImage` and
  `processImageColors` functions
    - Reports progress as percentage (0-100) during image processing
    - Detailed progress updates for different processing stages
    - Example: `fiberForge.parseImage(options, undefined, (progress) => console.log(\`${progress}%\`))`
- **WebWorker support**: Enhanced browser environment detection and support
    - Added `isWebWorker()` function for WebWorker environment detection
    - Improved `isBrowser()` function to correctly identify WebWorker contexts
    - Separate PNG creation implementations for different environments
- **Platform-specific PNG creation**: Split `createPngBase64` into environment-specific functions
    - `createPngBase64Server()` - for Node.js using pngjs library
    - `createPngBase64Browser()` - for browser using Canvas API
    - `createPngBase64WebWorker()` - for WebWorker using OffscreenCanvas
- **Enhanced error handling**: Added comprehensive error messages for different environments
    - Better environment-specific error reporting

### Changed

- **Breaking**: `createPngBase64` now requires `platform` parameter
    - Old: `createPngBase64(imageData, width, height)`
    - New: `createPngBase64(imageData, width, height, platform)`
- **Breaking**: `processImageColors` now requires `platform` parameter in configuration object
- **Enhanced JSDoc documentation**: All functions now have comprehensive English documentation with examples
- **Improved type safety**: Better TypeScript definitions for all new parameters and functions

### Fixed

- **WebWorker compatibility**: Fixed issues with DOM API usage in WebWorker environments
- **Canvas context handling**: Improved error handling for canvas context creation failures
- **Test coverage**: Updated all tests to work with new API parameters
- **Environment detection**: More reliable detection of browser vs WebWorker vs Node.js environments

### Technical Details

- Added detailed progress reporting at multiple stages:
    - Image loading (0-5%)
    - Color processing (5-85%)
    - Yarn matching (85-99%)
    - Completion (100%)
- WebWorker PNG creation uses `OffscreenCanvas.convertToBlob()` for optimal performance
- Manual base64 encoding for WebWorker compatibility
- Comprehensive test suite covering all environments and edge cases

### Migration Guide

If upgrading from previous versions:

1. Update `createPngBase64` calls to include platform parameter:
   ```typescript
   // Before
   await createPngBase64(data, width, height);
   
   // After  
   await createPngBase64(data, width, height, 'server');
   ```

2. Add platform to `processImageColors` calls:
   ```typescript
   // Before
   await processImageColors({ imageData, threshold });
   
   // After
   await processImageColors({ imageData, threshold, platform: 'server' });
   ```

3. Optionally add progress tracking:
   ```typescript
   await fiberForge.parseImage(options, undefined, (progress) => {
     console.log(`Processing: ${progress}%`);
   });
   ```

## [1.0.2-alpha.4] - 2025-10-09

### Added

- Alpha version with experimental features
- Progress tracking implementation (beta)
- WebWorker support (experimental)
- Platform-specific PNG creation (beta)

### Changed

- Breaking API changes for testing purposes
- Enhanced error handling for alpha testing

### Note

This is an alpha release for testing purposes. Use stable version 1.0.2 for production.

## [1.0.1] - 2025-10-08

### Added

- Initial stable release with basic image processing functionality
- Yarn color matching capabilities
- Cross-platform support (Node.js and Browser)

### Features

- Image color region detection using flood-fill algorithm
- Yarn color database integration
- Base64 PNG generation for color regions
- TypeScript definitions and comprehensive API documentation

---

**Note**: This changelog follows semantic versioning. Breaking changes are clearly marked and migration guidance is
provided.
