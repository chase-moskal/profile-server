
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
		return {
			userId,
			public: profile.public
		}
	}

	async getFullProfile({accessToken}: {accessToken: AccessToken}) {
		const {user} = await verifyToken<AccessPayload>({
			token: accessToken,
			publicKey: this._authServerPublicKey
		})
		const {userId} = user

		const profile = await this._collection.findOne<Profile>({userId})
		return {
			userId,
			public: profile.public,
			private: profile.private
		}
	}

	async setFullProfile({accessToken, profile: givenProfile}: {
		accessToken: AccessToken
		profile: Profile
	}) {
		const {user} = await verifyToken<AccessPayload>({
			token: accessToken,
			publicKey: this._authServerPublicKey
		})
		const {userId} = user

		const profile: Profile = {
			userId,
			public: givenProfile.public,
			private: givenProfile.private
		}

		await this._collection.updateOne({userId}, profile, {upsert: true})
	}
}
