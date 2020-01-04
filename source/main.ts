
import * as Koa from "koa"
import {readFile} from "fancyfs"
import * as mount from "koa-mount"
import {createApiServer} from "renraku/dist-cjs/server/create-api-server"

import {ProfileMagistrate} from "./modules/profile-magistrate"
import {createMongoCollection} from "./modules/create-mongo-collection"

import {Config, ProfileApi} from "./interfaces"

main().catch(error => console.error(error))

export async function main() {
	const config: Config = JSON.parse(<string>await readFile("config/config.json", "utf8"))
	const authServerPublicKey = <string>await readFile("config/auth-server.public.pem", "utf8")
	const profilesCollection = await createMongoCollection(config.database)

	//
	// PROFILE SERVER API
	// renraku json rpc api
	//

	const {koa: apiKoa} = createApiServer<ProfileApi>({
		debug: true,
		logger: console,
		exposures: {
			profileMagistrate: {
				exposed: new ProfileMagistrate({
					authServerPublicKey,
					collection: profilesCollection
				}),
				cors: {
					allowed: /^https?\:\/\/localhost\:8\d{3}$/i,
					forbidden: null
				},
			}
		},
	})

	//
	// run the koa server app
	//

	const koa = new Koa()
	koa.use(mount("/api", apiKoa))
	koa.listen(config.server.port)
	console.log(`Profile server listening on port ${config.server.port}`)
}
