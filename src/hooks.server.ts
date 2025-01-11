import type { Handle } from '@sveltejs/kit';
import { initWebSocket } from '$lib/server/websocket';

export const handle: Handle = async ({ event, resolve }) => {
	if (!globalThis.WebSocket) {
		initWebSocket(3001);
	}

	return resolve(event);
};
