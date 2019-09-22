
import {
	Profile,
	AccessToken,
	ProfilerTopic,
} from "authoritarian/dist/interfaces"

const prefix = "profiler"

export class ProfilerCache implements ProfilerTopic {
	private _storage: Storage
	private _profiler: ProfilerTopic
	private _cacheExpiryMilliseconds: number

	constructor(options: {
		storage: Storage
		profiler: ProfilerTopic
		cacheExpiryMinutes: number
	}) {
		this._storage = options.storage
		this._profiler = options.profiler
		this._cacheExpiryMilliseconds = options.cacheExpiryMinutes * (60 * 1000)
	}

	private _isExpired(cacheKey: string) {
		const last: number = JSON.parse(this._storage.getItem(`${cacheKey}-last`))
		if (!last) return true
		const since = Date.now() - last
		const expired = since > this._cacheExpiryMilliseconds
		return expired
	}

	private _writeToCache(cacheKey: string, profile: Profile) {
		this._storage.setItem(cacheKey, JSON.stringify(profile))
		this._storage.setItem(`${cacheKey}-last`, JSON.stringify(Date.now()))
	}

	async getFullProfile(options: {accessToken: AccessToken}) {
		const cacheKey = `${prefix}-full-profile`
		let profile: Profile

		if (this._isExpired(cacheKey)) {
			profile = await this._profiler.getFullProfile(options)
			this._writeToCache(cacheKey, profile)
		}
		else {
			profile = JSON.parse(this._storage.getItem(cacheKey))
		}
		
		return profile
	}

	async getPublicProfile(options: {userId: string}) {
		const cacheKey = `${prefix}-public-profile`
		let profile: Profile

		if (this._isExpired(cacheKey)) {
			profile = await this._profiler.getPublicProfile(options)
			this._writeToCache(cacheKey, profile)
		}
		else {
			profile = JSON.parse(this._storage.getItem(cacheKey))
		}

		return profile
	}

	async setFullProfile(options: {accessToken: AccessToken; profile: Profile}) {
		await this._profiler.setFullProfile(options)
		this._writeToCache(`${prefix}-full-profile`, options.profile)
		this._writeToCache(`${prefix}-public-profile`, {
			userId: options.profile.userId,
			public: options.profile.public
		})
	}
}
