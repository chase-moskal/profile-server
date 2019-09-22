
import {Host as CrosscallHost} from "crosscall/dist/cjs/host"
import {ProfilerApi} from "authoritarian/dist/cjs/interfaces"
import {profilerApiShape} from "authoritarian/dist/cjs/shapes"

import {
	createApiClient as createRenrakuApiClient
} from "renraku/dist/cjs/client/create-api-client"

import {ProfilerCache} from "./services/profiler-cache"

main()
	.then(() => console.log("🎟️ token script"))
	.catch(error => console.error(error))

async function main() {
	const {profiler} = await createRenrakuApiClient<ProfilerApi>({
		url: `${window.location.origin}/api`,
		shape: profilerApiShape
	})

	new CrosscallHost({
		namespace: "authoritarian-token-storage",

		callee: {
			topics: {
				profiler: <any>new ProfilerCache({
					storage: window.localStorage,
					cacheExpiryMinutes: 10,
					profiler
				})
			},
			events: {}
		},

		permissions: [{
			origin: /^https?:\/\/localhost:8\d{3}$/i,
			allowedTopics: {
				tokenStorage: ["getPublicProfile", "getFullProfile", "setFullProfile"]
			},
			allowedEvents: []
		}]
	})
}
