export const getHashParams = (): Record<string, string> => {
	const hashParams: Record<string, string> = {};

	// Check if we're running on the client side
	if (typeof window !== 'undefined') {
		let match: RegExpExecArray | null;
		const regex = /([^&;=]+)=?([^&;]*)/g;
		const queryString = window.location.hash.substring(1);

		while ((match = regex.exec(queryString))) {
			hashParams[match[1]] = decodeURIComponent(match[2]);
		}
	}

	return hashParams;
};
