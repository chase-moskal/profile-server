
import Koa from "koa"
import mount from "koa-mount"

import {promises} from "fs"
const {readFile} = promises

import {apiServer} from "renraku/dist/api-server.js"
import {unpackCorsConfig}
	from "authoritarian/dist/toolbox/unpack-cors-config.js"

import {connectMongo} from "./toolbox/connect-mongo.js"
import {ProfileMagistrate} from "./api/profile-magistrate.js"

import {Config, ProfileServerApi} from "./interfaces.js"

const configPath = "config"

main().catch(error => console.error(error))

export async function main() {
	const config: Config = JSON.parse(<string>await readFile(`${configPath}/config.json`, "utf8"))
	const authServerPublicKey = <string>await readFile(`${configPath}/auth-server.public.pem`, "utf8")
	const profilesCollection = await connectMongo(config.database)
	const host = "0.0.0.0"
	const port = config.server.port

	//
	// PROFILE SERVER API
	// renraku json rpc api
	//

	const {koa: apiKoa} = await apiServer<ProfileServerApi>({
		debug: true,
		logger: console,
		exposures: {
			profileMagistrate: {
				exposed: new ProfileMagistrate({
					authServerPublicKey,
					collection: profilesCollection
				}),
				cors: unpackCorsConfig(config.server.cors)
			}
		}
	})

	//
	// run the koa server app
	//

	const koa = new Koa()
	koa.use(mount("/api", apiKoa))
	koa.listen({host, port})
	console.log(`Profile server listening on port ${config.server.port}`)
}
