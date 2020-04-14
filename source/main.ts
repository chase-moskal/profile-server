
import Koa from "koa"
import mount from "koa-mount"
import {apiServer} from "renraku/dist/api-server.js"

import {curryVerifyToken} from "redcrypto/dist/curries/curry-verify-token.js"

import {Logger} from "authoritarian/dist/toolbox/logger.js"
import {health} from "authoritarian/dist/toolbox/health.js"
import {read, readYaml} from "authoritarian/dist/toolbox/reading.js"
import {connectMongo} from "authoritarian/dist/toolbox/connect-mongo.js"
import {deathWithDignity} from "authoritarian/dist/toolbox/death-with-dignity.js"
import {ProfileApi, ProfileServerConfig} from "authoritarian/dist/interfaces.js"
import {unpackCorsConfig} from "authoritarian/dist/toolbox/unpack-cors-config.js"
import {makeProfileMagistrate} from "authoritarian/dist/business/profile-magistrate/magistrate.js"
import {mongoProfileDatalayer} from "authoritarian/dist/business/profile-magistrate/mongo-profile-datalayer.js"

const logger = new Logger()
deathWithDignity({logger})

const paths = {
	config: "config/config.yaml",
	authServerPublicKey: "config/auth-server.public.pem",
}

~async function main() {
	const config: ProfileServerConfig = await readYaml(paths.config)
	const {port} = config.profileServer
	const authServerPublicKey = await read(paths.authServerPublicKey)
	const database = await connectMongo(config.mongo)
	const collection = database.collection("profiles")

	const profileMagistrate = makeProfileMagistrate({
		verifyToken: curryVerifyToken(authServerPublicKey),
		profileDatalayer: mongoProfileDatalayer({collection}),
	})

	const {koa: apiKoa} = await apiServer<ProfileApi>({
		logger,
		debug: true,
		exposures: {
			profileMagistrate: {
				exposed: profileMagistrate,
				cors: unpackCorsConfig(config.cors)
			}
		}
	})

	new Koa()
		.use(health({logger}))
		.use(mount("/api", apiKoa))
		.listen({host: "0.0.0.0", port})

	logger.info(`🌐 profile-server on ${port}`)

}().catch(error => logger.error(error))
