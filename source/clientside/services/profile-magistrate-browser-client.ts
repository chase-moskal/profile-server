
import {profileMagistrateShape} from "authoritarian/dist-cjs/shapes"
import {ProfileMagistrateTopic} from "authoritarian/dist-cjs/interfaces"
import {
	createBrowserApiClient
} from "renraku/dist-cjs/client/create-browser-api-client"

interface Api {
	profileMagistrate: ProfileMagistrateTopic
}

export async function createProfileMagistrateBrowserClient({url}: {
	url: string
}) {
	const {profileMagistrate} = await createBrowserApiClient<Api>({
		url,
		shape: {profileMagistrate: profileMagistrateShape}
	})
	return profileMagistrate
}
