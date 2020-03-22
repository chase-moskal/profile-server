
import {Collection} from "../commonjs/mongodb.js"

import {
	Profile,
	AccessToken,
	AccessPayload,
	ProfileMagistrateTopic,
} from "authoritarian/dist/interfaces.js"

import {tokenVerify} from "redcrypto/dist/token-verify.js"

export class ProfileMagistrate implements ProfileMagistrateTopic {
	private _collection: Collection
	private _authServerPublicKey: string

	constructor({collection, authServerPublicKey}: {
		collection: Collection
		authServerPublicKey: string
	}) {
		this._collection = collection
		this._authServerPublicKey = authServerPublicKey
	}

	async getProfile({userId}: {userId: string}): Promise<Profile> {
		return this._collection.findOne<Profile>({userId})
	}

	async setProfile({profile: givenProfile, accessToken}: {
		profile: Profile
		accessToken: AccessToken
	}): Promise<void> {
		console.log("SET FULL PROFILE", givenProfile)

		const {payload} = await tokenVerify<AccessPayload>({
			token: accessToken,
			publicKey: this._authServerPublicKey
		})
		const {userId} = payload.user

		if (userId !== givenProfile.userId)
			throw new Error("profile userId doesn't match your own")

		const errorWhenStringTooBig = (limit: number, value: string) => {
			if (value.length > limit) throw new Error("string in profile too big")
		}

		const {avatar, nickname, adminMode} = givenProfile

		errorWhenStringTooBig(1000, avatar)
		errorWhenStringTooBig(1000, nickname)
		if (typeof adminMode !== "boolean")
			throw new Error("adminMode must be a boolean")

		const profile: Profile = {
			userId,
			avatar,
			nickname,
			adminMode,
		}

		await this._collection.replaceOne({userId}, profile, {upsert: true})
	}
}
