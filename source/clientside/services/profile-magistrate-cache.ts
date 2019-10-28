
import {
	Profile,
	AccessToken,
	ProfileMagistrateTopic,
} from "authoritarian/dist-cjs/interfaces"

const prefix = "profile-magistrate-cache"

export class ProfileMagistrateCache implements ProfileMagistrateTopic {
	private _storage: Storage
	private _magistrate: ProfileMagistrateTopic
	private _cacheExpiryMilliseconds: number

	constructor(options: {
		storage: Storage
		profileMagistrate: ProfileMagistrateTopic
		cacheExpiryMinutes: number
	}) {
		this._storage = options.storage
		this._magistrate = options.profileMagistrate
		this._cacheExpiryMilliseconds = options.cacheExpiryMinutes * (60 * 1000)
	}

	private _readFromCache(cacheKey: string): {profile: Profile; last: number} {
		const rawProfile = this._storage.getItem(cacheKey)
		const rawLast = this._storage.getItem(`${cacheKey}-last`)

		const profile = rawProfile ? JSON.parse(rawProfile) : null
		const last = rawLast ? JSON.parse(rawLast) : null

		return {profile, last}
	}

	private _isExpired(last: number) {
		const since = Date.now() - last
		const expired = since > this._cacheExpiryMilliseconds
		return expired
	}

	private _writeToCache(cacheKey: string, profile: Profile) {
		this._storage.setItem(cacheKey, JSON.stringify(profile || ""))
		this._storage.setItem(`${cacheKey}-last`, JSON.stringify(Date.now()))
	}

	async getFullProfile(options: {accessToken: AccessToken}) {
		const cacheKey = `${prefix}-full-profile`
		let {profile, last} = this._readFromCache(cacheKey)

		if (!profile || this._isExpired(last)) {
			profile = await this._magistrate.getFullProfile(options)
			this._writeToCache(cacheKey, profile)
		}

		return profile
	}

	async getPublicProfile(options: {userId: string}) {
		const cacheKey = `${prefix}-public-profile`
		let {profile, last} = this._readFromCache(cacheKey)

		if (!profile || this._isExpired(last)) {
			profile = await this._magistrate.getPublicProfile(options)
			this._writeToCache(cacheKey, profile)
		}

		return profile
	}

	async setFullProfile(options: {accessToken: AccessToken; profile: Profile}) {
		await this._magistrate.setFullProfile(options)
		this._writeToCache(`${prefix}-full-profile`, options.profile)
		this._writeToCache(`${prefix}-public-profile`, {
			userId: options.profile.userId,
			public: options.profile.public
		})
	}
}
