export function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

export function isNode(): boolean {
	return typeof process !== 'undefined' && !!process.versions && !!process.versions.node;
}
