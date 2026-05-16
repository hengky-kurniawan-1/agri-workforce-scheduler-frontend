const DEFAULT_OSRM_URL = 'https://router.project-osrm.org';
const MEMORY_MAX = 128;
const STORAGE_MAX = 50;
const STORAGE_PREFIX = 'agri-osrm-v1:';
const STORAGE_INDEX_KEY = `${STORAGE_PREFIX}__index__`;

type LatLng = { lat: number; lng: number };

type StorageEntry = {
	cacheKey: string;
	positions: [number, number][];
	savedAt: number;
};

function osrmBaseUrl(): string {
	const url = import.meta.env.VITE_OSRM_URL?.replace(/\/$/, '');
	return url || DEFAULT_OSRM_URL;
}

export function routeCacheKey(stops: LatLng[]): string {
	const coords = stops.map((s) => `${s.lng},${s.lat}`).join(';');
	return `${osrmBaseUrl()}|${coords}`;
}

const memory = new Map<string, [number, number][]>();

function touchMemory(key: string, value: [number, number][]): void {
	if (memory.has(key)) memory.delete(key);
	memory.set(key, value);
	while (memory.size > MEMORY_MAX) {
		const oldest = memory.keys().next().value;
		if (oldest !== undefined) memory.delete(oldest);
	}
}

function hashKey(value: string): string {
	let h = 5381;
	for (let i = 0; i < value.length; i++) {
		h = (h * 33) ^ value.charCodeAt(i);
	}
	return (h >>> 0).toString(36);
}

function storageKeyFor(cacheKey: string): string {
	return `${STORAGE_PREFIX}${hashKey(cacheKey)}`;
}

function readStorageIndex(): string[] {
	try {
		const raw = localStorage.getItem(STORAGE_INDEX_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : [];
	} catch {
		return [];
	}
}

function writeStorageIndex(keys: string[]): void {
	try {
		localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(keys));
	} catch {
		// quota / private mode — ignore
	}
}

function readFromStorage(cacheKey: string): [number, number][] | undefined {
	const sk = storageKeyFor(cacheKey);
	try {
		const raw = localStorage.getItem(sk);
		if (!raw) return undefined;
		const entry = JSON.parse(raw) as StorageEntry;
		if (entry.cacheKey !== cacheKey || !Array.isArray(entry.positions)) return undefined;
		return entry.positions;
	} catch {
		return undefined;
	}
}

function writeToStorage(cacheKey: string, positions: [number, number][]): void {
	const sk = storageKeyFor(cacheKey);
	const entry: StorageEntry = { cacheKey, positions, savedAt: Date.now() };
	try {
		localStorage.setItem(sk, JSON.stringify(entry));
	} catch {
		return;
	}

	const index = readStorageIndex().filter((k) => k !== sk);
	index.push(sk);
	while (index.length > STORAGE_MAX) {
		const evict = index.shift();
		if (evict) {
			try {
				localStorage.removeItem(evict);
			} catch {
				// ignore
			}
		}
	}
	writeStorageIndex(index);
}

export function getCachedDrivingRoute(stops: LatLng[]): [number, number][] | undefined {
	if (stops.length < 2) return undefined;

	const key = routeCacheKey(stops);
	const mem = memory.get(key);
	if (mem) {
		touchMemory(key, mem);
		return mem;
	}

	const fromStorage = readFromStorage(key);
	if (fromStorage) {
		touchMemory(key, fromStorage);
		return fromStorage;
	}

	return undefined;
}

export function setCachedDrivingRoute(stops: LatLng[], positions: [number, number][]): void {
	if (stops.length < 2) return;

	const key = routeCacheKey(stops);
	touchMemory(key, positions);
	writeToStorage(key, positions);
}
