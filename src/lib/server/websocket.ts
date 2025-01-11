import { WebSocket } from 'ws';
import type { VideoCommand } from '$lib/types';
import { WebSocketServer } from 'ws';

export function initWebSocket(port: number) {
	let wss = new WebSocketServer({ port: port });

	console.log(`WebSocket server started on ws://localhost:${port}`);
	wss.on('connection', (ws) => {
		console.log('Client connected');

		ws.on('message', (message: string) => {
			const data: VideoCommand = JSON.parse(message);
			wss.clients.forEach((client) => {
				if (client !== ws) {
					client.send(JSON.stringify(data));
				}
			});
		});

		ws.on('close', () => {
			console.log('Client disconnected');
		});
	});
}
