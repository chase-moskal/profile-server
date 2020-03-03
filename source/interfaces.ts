
import {Api} from "renraku/dist/interfaces.js"
import {ProfileMagistrateTopic} from "authoritarian/dist/interfaces.js"

export interface ProfileServerApi extends Api<ProfileServerApi> {
	profileMagistrate: ProfileMagistrateTopic
}


export interface JsonRegex {
	pattern: string
	flags: string
}

export interface CorsConfig {
	allowed: JsonRegex
	forbidden?: JsonRegex
}

export interface Config {
	server: {
		port: number
		cors: CorsConfig
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
