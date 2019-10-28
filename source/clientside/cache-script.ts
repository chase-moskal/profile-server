
import {Host as CrosscallHost} from "crosscall/dist/cjs/host"
import {
	createProfileMagistrateBrowserClient
} from "./services/profile-magistrate-browser-client"
import {ProfileMagistrateCache} from "./services/profile-magistrate-cache"

main()
	.then(() => console.log("🤖"))
	.catch(error => console.error(error))

async function main() {
	const profileMagistrate = await createProfileMagistrateBrowserClient({
		url: `${window.location.origin}/api`
	})

	new CrosscallHost({
		namespace: "authoritarian-profile-magistrate-cache",

		callee: {
			topics: {
				profileMagistrate: <any>new ProfileMagistrateCache({
					storage: window.localStorage,
					cacheExpiryMinutes: 10,
					profileMagistrate
				})
			},
			events: {}
		},

		permissions: [{
			origin: /^https?:\/\/localhost:8\d{3}$/i,
			allowedTopics: {
				profileMagistrate: ["getPublicProfile", "getFullProfile", "setFullProfile"]
			},
			allowedEvents: []
		}]
	})
}
