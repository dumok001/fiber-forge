import fs from 'fs';
import path from 'path';


export function loadEnvFile(filePath: string): void {
	try {
		if (!fs.existsSync(filePath)) {
			console.warn(`Environment file not found: ${filePath}`);
			return;
		}
		
		const content = fs.readFileSync(filePath, 'utf8');
		const lines = content.split('\n');
		
		for (const line of lines) {
			const trimmedLine = line.trim();
			
			// Skip empty lines and comments
			if (!trimmedLine || trimmedLine.startsWith('#')) {
				continue;
			}
			
			// Parse key=value pairs
			const [key, ...valueParts] = trimmedLine.split('=');
			if (key && valueParts.length > 0) {
				const value = valueParts.join('=').trim();
				// Only set if not already defined
				if (!process.env[key]) {
					process.env[key] = value;
				}
			}
		}
	} catch (error) {
		console.warn(`Failed to load environment file ${filePath}:`, error);
	}
}


export function loadTestConfig(): void {
	const testEnvPath = path.resolve('./test.env.local');
	loadEnvFile(testEnvPath);
}
