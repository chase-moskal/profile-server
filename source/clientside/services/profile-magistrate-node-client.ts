
import {profileMagistrateShape} from "authoritarian/dist-cjs/shapes"
import {ProfileMagistrateTopic} from "authoritarian/dist-cjs/interfaces"
import {
	createNodeApiClient
} from "renraku/dist-cjs/client/create-node-api-client"

interface Api {
	profileMagistrate: ProfileMagistrateTopic
}

export async function createProfileMagistrateNodeClient({url}: {url: string}) {
	const {profileMagistrate} = await createNodeApiClient<Api>({
		url,
		shape: {profileMagistrate: profileMagistrateShape}
	})
	return profileMagistrate
}
