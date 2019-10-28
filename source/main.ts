
import * as pug from "pug"
import * as Koa from "koa"
import {readFile} from "fancyfs"
import * as cors from "@koa/cors"
import * as mount from "koa-mount"
import * as serve from "koa-static"
import {createApiServer} from "renraku/dist-cjs/server/create-api-server"

import {httpHandler} from "./modules/http-handler"
import {ProfileMagistrate} from "./modules/profile-magistrate"
import {createMongoCollection} from "./modules/create-mongo-collection"

import {Config, Api} from "./interfaces"

const getTemplate = async(filename: string) =>
	pug.compile(<string>await readFile(`source/clientside/templates/${filename}`, "utf8"))

main().catch(error => console.error(error))

export async function main() {
	const config: Config = JSON.parse(<string>await readFile("config/config.json", "utf8"))
	const authServerPublicKey = <string>await readFile("config/auth-server.public.pem", "utf8")
	const profilesCollection = await createMongoCollection(config.database)

	//
	// HTML KOA
	// compiles pug templates
	// also serves the clientside dir
	//

	const templates = {
		profileMagistrateCache: await getTemplate("profile-magistrate-cache.pug")
	}

	const htmlKoa = new Koa()
	htmlKoa.use(cors())

	// magistrate cache
	htmlKoa.use(httpHandler("get", "/profile-magistrate-cache", async() => {
		console.log("/profile-magistrate-cache")
		return templates.profileMagistrateCache()
	}))

	// static clientside content
	htmlKoa.use(serve("dist/clientside"))

	//
	// PROFILE SERVER API
	// renraku json rpc api
	//

	const {koa: apiKoa} = createApiServer<Api>({
		debug: true,
		logger: console,
		topics: {
			profileMagistrate: {
				cors: {
					allowed: /^https?\:\/\/localhost\:8\d{3}$/i,
					forbidden: null
				},
				exposed: new ProfileMagistrate({
					authServerPublicKey,
					collection: profilesCollection
				})
			}
		},
	})

	//
	// run the koa server app
	//

	const koa = new Koa()
	koa.use(mount("/html", htmlKoa))
	koa.use(mount("/api", apiKoa))
	koa.listen(config.server.port)
	console.log(`Profile server listening on port ${config.server.port}`)
}
