
import Koa from "koa"
import mount from "koa-mount"
import {apiServer} from "renraku/dist/api-server.js"

import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import {read, readYaml} from "authoritarian/dist/toolbox/reading.js"
import {connectMongo} from "authoritarian/dist/toolbox/connect-mongo.js"
import {ProfileApi, ProfileServerConfig} from "authoritarian/dist/interfaces.js"
import {unpackCorsConfig} from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {makeProfileMagistrate} from "authoritarian/dist/business/profile-magistrate/magistrate.js"
import {mongoProfileDatalayer} from "authoritarian/dist/business/profile-magistrate/mongo-profile-datalayer.js"

const paths = {
	config: "config/config.yaml",
	authServerPublicKey: "config/auth-server.public.pem",
}

~async function main() {
	const config: ProfileServerConfig = await readYaml(paths.config)
	const {port} = config.profileServer
	const authServerPublicKey = await read(paths.authServerPublicKey)
	const collection = await connectMongo(config.mongo, "profiles")

	const profileMagistrate = makeProfileMagistrate({
		verifyToken: curryVerifyToken(authServerPublicKey),
		profileDatalayer: mongoProfileDatalayer({collection}),
	})

	const {koa: apiKoa} = await apiServer<ProfileApi>({
		debug: true,
		logger: console,
		exposures: {
			profileMagistrate: {
				exposed: profileMagistrate,
				cors: unpackCorsConfig(config.cors)
			}
		}
	})

	new Koa()
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})

	console.log(`🌐 profile-server on ${port}`)
}()
