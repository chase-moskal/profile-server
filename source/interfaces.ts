
import {TopicApi} from "renraku/dist-cjs/interfaces"
import {ProfileMagistrateTopic} from "authoritarian/dist-cjs/interfaces"

export interface Api extends TopicApi<Api> {
	profileMagistrate: ProfileMagistrateTopic
}

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
