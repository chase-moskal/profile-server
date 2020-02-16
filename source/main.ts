
// TODO cjs
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _Koa from "koa"
import * as _fancyfs from "fancyfs"
import * as _mount from "koa-mount"
const Koa = require("koa") as typeof _Koa
const fancyfs = require("fancyfs") as typeof _fancyfs
const mount = require("koa-mount") as typeof _mount

import {apiServer} from "renraku/dist/api-server.js"

import {Config, ProfileApi} from "./interfaces.js"
import {ProfileMagistrate} from "./modules/profile-magistrate.js"
import {createMongoCollection} from "./modules/create-mongo-collection.js"

main().catch(error => console.error(error))

export async function main() {

	const config: Config =
		JSON.parse(<string>await fancyfs.readFile("config/config.json", "utf8"))

	const authServerPublicKey =
		<string>await fancyfs.readFile("config/auth-server.public.pem", "utf8")

	const profilesCollection = await createMongoCollection(config.database)

	//
	// PROFILE SERVER API
	// renraku json rpc api
	//

	const {koa: apiKoa} = await apiServer<ProfileApi>({
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
