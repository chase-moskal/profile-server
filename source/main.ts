
// TODO cjs
import mod from "module"
const require = mod.createRequire(import.meta.url)
import * as _Koa from "koa"
import * as _mount from "koa-mount"
const Koa: typeof _Koa = require("koa") as typeof _Koa
const mount: typeof _mount = require("koa-mount") as typeof _mount

import {promises} from "fs"
const {readFile} = promises

import {apiServer} from "renraku/dist/api-server.js"
import {unpackCorsConfig}
	from "authoritarian/dist/toolbox/unpack-cors-config.js"

import {ProfileMagistrate} from "./modules/profile-magistrate.js"
import {createMongoCollection} from "./modules/create-mongo-collection.js"

import {Config, ProfileServerApi} from "./interfaces.js"

const configPath = "config"

main().catch(error => console.error(error))

export async function main() {
	const config: Config = JSON.parse(<string>await readFile(`${configPath}/config.json`, "utf8"))
	const authServerPublicKey = <string>await readFile(`${configPath}/auth-server.public.pem`, "utf8")
	const profilesCollection = await createMongoCollection(config.database)

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
	koa.listen(config.server.port)
	console.log(`Profile server listening on port ${config.server.port}`)
}
