
import {Collection} from "mongodb"
import {
	Profile,
	AccessToken,
	AccessPayload,
	ProfileMagistrateTopic,
} from "authoritarian/dist-cjs/interfaces"

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

	async setProfile({accessToken, profile: givenProfile}: {
		accessToken: AccessToken
		profile: Profile
	}) {
		console.log("SET FULL PROFILE")

		const {payload} = await tokenVerify<AccessPayload>({
			token: accessToken,
			publicKey: this._authServerPublicKey
		})
		const {userId} = payload.user

		const errorWhenStringTooBig = (limit: number, value: string) => {
			if (value.length > limit) throw new Error("string in profile too big!")
		}

		errorWhenStringTooBig(1000, givenProfile.avatar)
		errorWhenStringTooBig(1000, givenProfile.nickname)

		const profile: Profile = {
			userId,
			avatar: givenProfile.avatar,
			nickname: givenProfile.nickname,
		}

		await this._collection.replaceOne({userId}, profile, {upsert: true})
	}
}
