
import * as pug from "pug"
import * as Koa from "koa"
import {readFile} from "fancyfs"
import * as mount from "koa-mount"
import * as serve from "koa-static"
import {OAuth2Client} from "google-auth-library"
import {ProfilerApi} from "authoritarian/dist/cjs/interfaces"
import {createApiServer} from "renraku/dist/cjs/server/create-api-server"

import {Profiler} from "./modules/profiler"
import {httpHandler} from "./modules/http-handler"
import {createMongoCollection} from "./modules/create-mongo-collection"

import {Config} from "./interfaces"

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
		profilerCache: await getTemplate("profiler-cache.pug")
	}

	const htmlKoa = new Koa()

	// profiler cache
	htmlKoa.use(httpHandler("get", "/profiler-cache", async() => {
		console.log("/profiler-cache")
		return templates.profilerCache()
	}))

	// static clientside content
	htmlKoa.use(serve("dist/clientside"))

	//
	// AUTH EXCHANGER
	// renraku json rpc api
	//

	const {koa: profilerKoa} = createApiServer<ProfilerApi>({
		debug: true,
		logger: console,
		exposures: [
			{
				allowed: /^http\:\/\/localhost\:8\d{3}$/i,
				forbidden: null,
				exposed: {
					profiler: new Profiler({
						authServerPublicKey,
						collection: profilesCollection
					})
				}
			}
		]
	})

	//
	// run the koa server app
	//

	const koa = new Koa()
	koa.use(mount("/html", htmlKoa))
	koa.use(mount("/api", profilerKoa))
	koa.listen(config.profiler.port)
	console.log(`Auth server listening on port ${config.profiler.port}`)
}

