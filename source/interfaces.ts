
export interface Config {
	profiler: {
		port: number
	}
	profilerCache: {
		allowedOriginsRegex: [string, string]
	}
	database: {
		uri: string
		dbName: string
		collectionName: string
	}
}

export interface MongoDatabaseConfig {
	uri: string
	dbName: string
	collectionName: string
}
