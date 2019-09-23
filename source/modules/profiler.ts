
import {Collection} from "mongodb"
import {
	Profile,
	AccessToken,
	ProfilerTopic,
	AccessPayload,
} from "authoritarian/dist/cjs/interfaces"

import {verifyToken} from "authoritarian/dist/cjs/crypto"

export class Profiler implements ProfilerTopic {
	private _collection: Collection
	private _authServerPublicKey: string

	constructor({collection, authServerPublicKey}: {
		collection: Collection
		authServerPublicKey: string
	}) {
		this._collection = collection
		this._authServerPublicKey = authServerPublicKey
	}

	async getPublicProfile({userId}: {userId: string}): Promise<Profile> {
		const profile = await this._collection.findOne<Profile>({userId})
		return profile
			? {
				userId,
				public: profile.public
			}
			: null
	}

	async getFullProfile({accessToken}: {accessToken: AccessToken}) {
		const {payload} = await verifyToken<AccessPayload>({
			token: accessToken,
			publicKey: this._authServerPublicKey
		})

		const {userId} = payload.user
		const profile = await this._collection.findOne<Profile>({userId})

		return profile
			? {
				userId,
				public: profile.public,
				private: profile.private
			}
			: null
	}

	async setFullProfile({accessToken, profile: givenProfile}: {
		accessToken: AccessToken
		profile: Profile
	}) {
		console.log("SET FULL PROFILE")

		const {payload} = await verifyToken<AccessPayload>({
			token: accessToken,
			publicKey: this._authServerPublicKey
		})
		const {userId} = payload.user

		const errorWhenStringTooBig = (limit: number, value: string) => {
			if (value.length > limit) throw new Error("string in profile too big!")
		}

		errorWhenStringTooBig(1000, givenProfile.public.picture)
		errorWhenStringTooBig(1000, givenProfile.public.nickname)
		errorWhenStringTooBig(1000, givenProfile.private.realname)

		const profile: Profile = {
			userId,
			public: {
				picture: givenProfile.public.picture,
				nickname: givenProfile.public.nickname,
			},
			private: {
				realname: givenProfile.private.realname,
			}
		}

		await this._collection.updateOne({userId}, profile, {upsert: true})
	}
}
