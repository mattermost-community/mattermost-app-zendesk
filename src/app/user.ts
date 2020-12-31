import {oauth} from '../store'

export function isUserConnected(userID: string): boolean {
  const [_, found] = oauth.getToken(userID)
	return found
}
