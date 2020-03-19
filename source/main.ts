
const paths = {
	config: "config/config.yaml",
	authServerPublicKey: "config/auth-server.public.pem",
}

import Koa from "koa"
import mount from "koa-mount"
import {apiServer} from "renraku/dist/api-server.js"
import {unpackCorsConfig}
	from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {ProfileServerConfig} from "authoritarian/dist/interfaces.js"

import {read, readYaml} from "./toolbox/reading.js"
import {connectMongo} from "./toolbox/connect-mongo.js"
import {ProfileServerApi} from "./interfaces.js"
import {ProfileMagistrate} from "./api/profile-magistrate.js"

~async function main() {
	const config: ProfileServerConfig = await readYaml(paths.config)
	const {port} = config.profileServer
	const authServerPublicKey = await read(paths.authServerPublicKey)
	const profilesCollection = await connectMongo({
		...config.mongo,
		collection: "profiles",
	})

	const {koa: apiKoa} = await apiServer<ProfileServerApi>({
		debug: true,
		logger: console,
		exposures: {
			profileMagistrate: {
				exposed: new ProfileMagistrate({
					authServerPublicKey,
					collection: profilesCollection,
				}),
				cors: unpackCorsConfig(config.cors)
			}
		}
	})

	new Koa()
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})

	console.log(`🌐 profile-server on ${port}`)
}()
