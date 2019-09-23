
import {ProfilerApi} from "authoritarian/dist/cjs/interfaces"
import {profilerApiShape} from "authoritarian/dist/cjs/shapes"
import {createNodeApiClient} from "renraku/dist/cjs/client/create-node-api-client"

export async function createProfilerClient({url}: {url: string}) {
	const {profiler} = await createNodeApiClient<ProfilerApi>({
		url,
		shape: profilerApiShape
	})
	return profiler
}
