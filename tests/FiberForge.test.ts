/**
 * Unit tests for FiberForge main class
 */

import FiberForge, {YarnColorName} from '../index';
import {HexColor, ImageData} from '../types';
import {getImageData} from '../utils/imageData';
import {processImageColors} from '../utils/processImageColors';
import {getAverageColor, getClosestColors} from '../utils/colors';

// Mock dependencies
jest.mock('../utils/imageData');
jest.mock('../utils/processImageColors');
jest.mock('../utils/colors');

const mockGetImageData = getImageData as jest.MockedFunction<typeof getImageData>;
const mockProcessImageColors = processImageColors as jest.MockedFunction<typeof processImageColors>;
const mockGetAverageColor = getAverageColor as jest.MockedFunction<typeof getAverageColor>;
const mockGetClosestColors = getClosestColors as jest.MockedFunction<typeof getClosestColors>;

describe('FiberForge', () => {
	let fiberForge: FiberForge;
	
	beforeEach(() => {
		jest.clearAllMocks();
		fiberForge = new FiberForge({platform: 'server'});
	});
	
	describe('Constructor', () => {
		it('should create instance with default platform', () => {
			const defaultForge = new FiberForge({});
			expect(defaultForge).toBeInstanceOf(FiberForge);
		});
		
		it('should create instance with specified platform', () => {
			const browserForge = new FiberForge({platform: 'browser'});
			expect(browserForge).toBeInstanceOf(FiberForge);
		});
	});
	
	describe('Yarn management', () => {
		it('should add yarn color', () => {
			const color: HexColor = '#FF5733';
			const yarnName: YarnColorName = 'test-yarn';
			
			fiberForge.addYarn(color, yarnName);
			
			// Since yarns is a setter, we test through parseImage behavior
			expect(() => fiberForge.addYarn(color, yarnName)).not.toThrow();
		});
		
		it('should set multiple yarns', () => {
			const yarns = {
				'yarn1': '#FF5733' as HexColor,
				'yarn2': '#33FF57' as HexColor
			};
			
			fiberForge.yarns = yarns;
			
			expect(() => {
				fiberForge.yarns = yarns;
			}).not.toThrow();
		});
	});
	
	describe('parseImage', () => {
		const mockImageData: ImageData = {
			width: 100,
			height: 100,
			channels: 4,
			data: new Uint8Array(40000)
		};
		
		const mockProcessedData = [
			{
				color: '#FF5733' as HexColor,
				pixelCount: 500,
				imagePart: {
					base64: 'data:image/png;base64,mock',
					marginX: 0,
					marginY: 0,
					marginXPercent: 0,
					marginYPercent: 0,
					widthPercent: 50,
					heightPercent: 50
				}
			}
		];
		
		beforeEach(() => {
			mockGetImageData.mockResolvedValue(mockImageData);
			mockProcessImageColors.mockResolvedValue(mockProcessedData);
			mockGetClosestColors.mockReturnValue([
				{yarn: 'yarn1.jpg', color: '#FF5733' as HexColor, dist: 5}
			]);
		});
		
		it('should parse image with maxWidthCm', async () => {
			const options = {
				imagePath: './test.jpg',
				maxWidthCm: 10,
				threshold: 15
			};
			
			const result = await fiberForge.parseImage(options);
			
			expect(mockGetImageData).toHaveBeenCalledWith('./test.jpg', 'server');
			expect(mockProcessImageColors).toHaveBeenCalledWith({
				imageData: mockImageData,
				threshold: 15,
				minimalSquarePixelArea: 200
			});
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveProperty('areaInCm');
			expect(result[0]).toHaveProperty('percentage');
			expect(result[0]).toHaveProperty('yarns');
		});
		
		it('should parse image with maxHeightCm', async () => {
			const options = {
				imagePath: './test.jpg',
				maxHeightCm: 15,
				threshold: 20
			};
			
			const result = await fiberForge.parseImage(options);
			
			expect(result).toHaveLength(1);
			expect(result[0].areaInCm).toBeGreaterThan(0);
		});
		
		it('should use default threshold when not provided', async () => {
			const options = {
				imagePath: './test.jpg',
				maxWidthCm: 10
			};
			
			await fiberForge.parseImage(options);
			
			expect(mockProcessImageColors).toHaveBeenCalledWith({
				imageData: mockImageData,
				threshold: 25,
				minimalSquarePixelArea: 200
			});
		});
		
		it('should calculate area correctly', async () => {
			const options = {
				imagePath: './test.jpg',
				maxWidthCm: 10
			};
			
			const result = await fiberForge.parseImage(options);
			
			// pixelInCm = 100 / 10 = 10
			// areaInCm = 500 / (10 * 10) = 5
			expect(result[0].areaInCm).toBe(5);
		});
		
		it('should calculate percentage correctly', async () => {
			const options = {
				imagePath: './test.jpg',
				maxWidthCm: 10
			};
			
			const result = await fiberForge.parseImage(options);
			
			// percentage = (500 / 500) * 100 = 100%
			expect(result[0].percentage).toBe(100);
		});
		
		it('should include yarn matches when yarn data is available', async () => {
			fiberForge.yarns = {
				'yarn1.jpg': '#FF5733' as HexColor
			};
			
			const options = {
				imagePath: './test.jpg',
				maxWidthCm: 10
			};
			
			const result = await fiberForge.parseImage(options);
			
			expect(mockGetClosestColors).toHaveBeenCalled();
			expect(result[0].yarns).toHaveLength(1);
		});
		
		it('should limit yarn matches to maxCountYarns', async () => {
			fiberForge.yarns = {
				'yarn1.jpg': '#FF5733' as HexColor
			};
			
			mockGetClosestColors.mockReturnValue([
				{yarn: 'yarn1.jpg', color: '#FF5733' as HexColor, dist: 5},
				{yarn: 'yarn2.jpg', color: '#FF5734' as HexColor, dist: 6},
				{yarn: 'yarn3.jpg', color: '#FF5735' as HexColor, dist: 7},
			]);
			
			const options = {
				imagePath: './test.jpg',
				maxWidthCm: 10,
				maxCountYarns: 2
			};
			
			const result = await fiberForge.parseImage(options);
			
			expect(result[0].yarns).toHaveLength(2);
		});
		
		it('should throw error when neither maxWidthCm nor maxHeightCm provided', async () => {
			const options = {
				imagePath: './test.jpg'
			} as any;
			
			await expect(fiberForge.parseImage(options)).rejects.toThrow('Either maxWidthCm or maxHeightCm must be provided');
		});
	});
	
	describe('parseYarn', () => {
		const mockImageData: ImageData = {
			width: 100,
			height: 100,
			channels: 4,
			data: new Uint8Array(40000)
		};
		
		beforeEach(() => {
			mockGetImageData.mockResolvedValue(mockImageData);
			mockGetAverageColor.mockResolvedValue('#FF5733' as HexColor);
		});
		
		it('should parse yarn color from region', async () => {
			const yarnPath = './yarn.jpg';
			const region = {x0: 10, y0: 10, x1: 50, y1: 50};
			
			const result = await fiberForge.parseYarn(yarnPath, region);
			
			expect(mockGetImageData).toHaveBeenCalledWith(yarnPath, 'server');
			expect(mockGetAverageColor).toHaveBeenCalledWith(mockImageData, region);
			expect(result).toBe('#FF5733');
		});
	});
	
	describe('Error handling', () => {
		it('should handle image loading errors', async () => {
			mockGetImageData.mockRejectedValue(new Error('Image not found'));
			
			const options = {
				imagePath: './nonexistent.jpg',
				maxWidthCm: 10
			};
			
			await expect(fiberForge.parseImage(options)).rejects.toThrow('Image not found');
		});
		
		it('should handle processing errors', async () => {
			const mockImageData: ImageData = {
				width: 100,
				height: 100,
				channels: 4,
				data: new Uint8Array(40000)
			};
			
			mockGetImageData.mockResolvedValue(mockImageData);
			mockProcessImageColors.mockRejectedValue(new Error('Processing failed'));
			
			const options = {
				imagePath: './test.jpg',
				maxWidthCm: 10
			};
			
			await expect(fiberForge.parseImage(options)).rejects.toThrow('Processing failed');
		});
	});
});
