import axios from 'axios';
import { getHashParams } from './helpers';
import { clearUser } from '../store/userStore';

const BASE_URL = 'https://api.spotify.com/v1';
// TOKENS ******************************************************************************************
const EXPIRATION_TIME = 3600 * 1000; // 3600 seconds * 1000 = 1 hour in milliseconds

// Utility functions for localStorage management with type safety
const setTokenTimestamp = (): void => {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem('spotify_token_timestamp', Date.now().toString());
	}
};

const setLocalAccessToken = (token: string): void => {
	setTokenTimestamp();
	if (typeof window !== 'undefined') {
		window.localStorage.setItem('spotify_access_token', token);
	}
};

const setLocalRefreshToken = (token: string): void => {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem('spotify_refresh_token', token);
	}
};

const getTokenTimestamp = (): number | null => {
	if (typeof window !== 'undefined') {
		const timestamp = window.localStorage.getItem('spotify_token_timestamp');
		return timestamp ? parseInt(timestamp, 10) : null;
	} else return 0;
};

const getLocalAccessToken = (): string | null => {
	if (typeof window !== 'undefined') {
		return window.localStorage.getItem('spotify_access_token');
	} else return '';
};

const getLocalRefreshToken = (): string | null => {
	if (typeof window !== 'undefined') {
		return window.localStorage.getItem('spotify_refresh_token');
	} else return '';
};

// Refresh the token
const refreshAccessToken = async (): Promise<void> => {
	try {
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem('spotify_token_timestamp');
			window.localStorage.removeItem('spotify_access_token');
			window.localStorage.removeItem('spotify_refresh_token');

			window.location.href = 'http://localhost:5173/'; // Adjust for your server's address
		}
	} catch (error) {
		console.error('Error refreshing access token:', error);
	}
};

// Get access token off of query params (called on application init)
export const getAccessToken = (): string | null => {
	const { error, access_token, refresh_token } = getHashParams();

	if (error) {
		console.error(error);
		refreshAccessToken();
		return null;
	}

	const tokenTimestamp = getTokenTimestamp();

	// If token has expired
	if (tokenTimestamp && Date.now() - tokenTimestamp > EXPIRATION_TIME) {
		console.warn('Access token has expired, refreshing...');
		refreshAccessToken();
		return null;
	}

	const localAccessToken = getLocalAccessToken();

	// If there is no access token in local storage, set it and return `access_token` from params
	if ((!localAccessToken || localAccessToken === 'undefined') && access_token) {
		setLocalAccessToken(access_token);
		if (refresh_token) {
			setLocalRefreshToken(refresh_token);
		}
		return access_token;
	}

	return localAccessToken;
};

// Export the token
export const token = getAccessToken();

export const logout = () => {
	if (typeof window !== 'undefined') {
		window.localStorage.removeItem('spotify_token_timestamp');
		window.localStorage.removeItem('spotify_access_token');
		window.localStorage.removeItem('spotify_refresh_token');
		clearUser();
		window.location.href =
			'https://spotify-spotlight-fgod-kmqj04sm1-chivaughns-projects.vercel.app/'; // Adjust for your server's address
	}
};

// API CALLS ***************************************************************************************

const headers = {
	Authorization: `Bearer ${token}`,
	'Content-Type': 'application/json'
};

/**
 * Get Current User's Profile
 * https://developer.spotify.com/documentation/web-api/reference/users-profile/get-current-users-profile/
 */
export const getUser = () => axios.get(`${BASE_URL}/me`, { headers });

/**
 Search
*/

export async function searchSongs(query: any, token: any) {
	try {
		const response = await axios.get(`${BASE_URL}/search`, {
			params: {
				q: query,
				type: 'track',
				limit: 10
			},
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		return response.data.tracks.items;
	} catch (error) {
		console.error('Error searching for songs:', error);
		return [];
	}
}
