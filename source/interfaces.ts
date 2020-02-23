
import {Api} from "renraku/dist/interfaces.js"
import {ProfileMagistrateTopic} from "authoritarian/dist/interfaces.js"

export interface ProfileServerApi extends Api<ProfileServerApi> {
	profileMagistrate: ProfileMagistrateTopic
}

export interface Config {
	server: {
		port: number
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
