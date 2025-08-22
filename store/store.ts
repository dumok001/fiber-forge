import * as fs from 'fs/promises';
import * as path from 'path';
import {FileStoreName, IStore} from "store";

export class VirtualStore implements IStore {
	private storage: Map<string, string> = new Map();
	
	get length(): number {
		return this.storage.size;
	}
	
	async getItem(key: string): Promise<string | null> {
		return this.storage.get(key) || null;
	}
	
	async getItems() {
		const items: Record<string, string> = {};
		for (const [key, value] of this.storage.entries()) {
			items[key] = value;
		}
		return items;
	}
	
	async setItem(key: string, value: string): Promise<void> {
		this.storage.set(key, value);
	}
	
	async setItems(items: Record<string, string>): Promise<void> {
		for (const [key, value] of Object.entries(items)) {
			this.storage.set(key, value);
		}
	}
	
	async removeItem(key: string): Promise<void> {
		this.storage.delete(key);
	}
	
	async clear(): Promise<void> {
		this.storage.clear();
	}
	
	key(index: number): string | null {
		const keys = Array.from(this.storage.keys());
		return keys[index] || null;
	}
}


export class FileStore implements IStore {
	private readonly filePath: string;
	private storage: Map<string, string> = new Map();
	
	constructor(fileName: FileStoreName = 'store.json', _path: string = '') {
		this.filePath = path.resolve(process.cwd() + _path, fileName);
	}
	
	get length(): number {
		return this.storage.size;
	}
	
	static async ensureFileExists(fileName: FileStoreName = 'store.json', _path: string = '') {
		const filePath = path.resolve(process.cwd() + _path, fileName);
		
		try {
			await fs.access(filePath);
		} catch {
			await fs.mkdir(path.dirname(filePath), {recursive: true});
			await fs.writeFile(filePath, '{}', 'utf-8');
		}
	}
	
	async getItem(key: string): Promise<string | null> {
		await this.loadFromFile();
		return this.storage.get(key) || null;
	}
	
	async getItems() {
		await this.loadFromFile();
		const items: Record<string, string> = {};
		for (const [key, value] of this.storage.entries()) {
			items[key] = value;
		}
		return items;
	}
	
	async setItem(key: string, value: string): Promise<void> {
		await this.loadFromFile();
		this.storage.set(key, value);
		await this.saveToFile();
	}
	
	async setItems(items: Record<string, string>): Promise<void> {
		await this.loadFromFile();
		for (const [key, value] of Object.entries(items)) {
			this.storage.set(key, value);
		}
		await this.saveToFile();
	}
	
	async removeItem(key: string): Promise<void> {
		await this.loadFromFile();
		this.storage.delete(key);
		await this.saveToFile();
	}
	
	async clear(): Promise<void> {
		this.storage.clear();
		await this.saveToFile();
	}
	
	key(index: number): string | null {
		const keys = Array.from(this.storage.keys());
		return keys[index] || null;
	}
	
	private async loadFromFile() {
		try {
			const data = await fs.readFile(this.filePath, 'utf-8');
			const obj = JSON.parse(data);
			this.storage = new Map(Object.entries(obj));
		} catch {
			this.storage = new Map();
		}
	}
	
	private async saveToFile() {
		await fs.mkdir(path.dirname(this.filePath), {recursive: true});
		const obj = Object.fromEntries(this.storage);
		await fs.writeFile(this.filePath, JSON.stringify(obj, null, 2), 'utf-8');
	}
	
}
