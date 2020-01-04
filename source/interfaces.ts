
import {ProfileApi} from "authoritarian/dist-cjs/interfaces"

export {ProfileApi}

export interface Config {
	server: {
		port: number
	}
	magistrateCache: {
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
