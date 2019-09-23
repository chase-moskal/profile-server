
import {ProfilerCache} from "./services/profiler-cache"
import {Host as CrosscallHost} from "crosscall/dist/cjs/host"
import {createProfilerClient} from "./services/profiler-client"

main()
	.then(() => console.log("profiler"))
	.catch(error => console.error(error))

async function main() {
	const profiler = await createProfilerClient({
		url: `${window.location.origin}/api`
	})

	new CrosscallHost({
		namespace: "authoritarian-profiler-cache",

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
				profiler: ["getPublicProfile", "getFullProfile", "setFullProfile"]
			},
			allowedEvents: []
		}]
	})
}
