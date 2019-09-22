
import {ProfilerApi} from "authoritarian/dist/interfaces"
import {profilerApiShape} from "authoritarian/dist/cjs/shapes"
import {createApiClient} from "renraku/dist/cjs/client/create-api-client"

export async function createProfilerClient({url}: {url: string}) {
	const {profiler} = await createApiClient<ProfilerApi>({
		url,
		shape: profilerApiShape
	})
	return profiler
}
