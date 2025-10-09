/**
 * Global type declarations for cross-platform compatibility
 * These declarations allow TypeScript to work with browser globals in Node.js environment
 */
declare global {
	/** Browser window object - available only in browser environment */
	var window: any;
	/** Browser document object - available only in browser environment */
	var document: any;
	/** Universal global object - available in both browser and Node.js */
	var globalThis: any;
	var self: DedicatedWorkerGlobalScope;
	
	function importScripts(...urls: string[]): void;
}

// This export statement makes this file a module
export {};
