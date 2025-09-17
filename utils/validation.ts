/**
 * Validation utilities for input parameters
 */

import {YarnColorsData} from '../types/index.js';

/**
 * Validates if a threshold value is within acceptable range
 * @param value - The threshold value to validate
 * @param minThreshold - Minimum allowed threshold (default: 0)
 * @param maxThreshold - Maximum allowed threshold (default: 100)
 * @returns true if threshold is valid, false otherwise
 */
export function isValidThreshold(value: number, minThreshold = 0, maxThreshold = 100): boolean {
	return Number.isInteger(value) && value >= minThreshold && value <= maxThreshold;
}

/**
 * Validates if a string is a valid image file path
 * @param path - The path to validate
 * @returns true if path has valid image extension
 */
export function isValidImagePath(path: string): boolean {
	if (path.trim().length === 0) {
		return false;
	}
	const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
	const lowercasePath = path.toLowerCase();
	
	return validExtensions.some(ext => lowercasePath.endsWith(ext));
}

/**
 * Validates if a number is within a specified range
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns true if value is within range, false otherwise
 */
export function isValueInRange(value: number, min: number, max: number): boolean {
	return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

/**
 * Validates if a value is a positive integer
 * @param value - The value to validate
 * @returns true if value is a positive integer, false otherwise
 */
export function isPositiveInteger(value: number): boolean {
	return Number.isInteger(value) && value > 0;
}

/**
 * Validates if yarns data is valid
 * @param yarns - The yarns data to validate
 * @returns true if yarns data is valid, false otherwise
 */
export function isValidYarnsData(yarns: any): yarns is YarnColorsData {
	if (
		!yarns ||
		typeof yarns !== 'object' ||
		Array.isArray(yarns) ||
		Object.keys(yarns).length === 0 ||
		!Object.values(yarns).every(
			color => typeof color === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)
		)
	) {
		return false;
	}
	return true;
}
