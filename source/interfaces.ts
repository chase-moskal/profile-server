
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
	profileServer: {
		port: number
	}
	cors: CorsConfig
	mongo: {
		link: string
		database: string
	}
}

export interface MongoDatabaseConfig {
	link: string
	database: string
	collection: string
}
