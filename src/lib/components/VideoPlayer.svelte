<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { VideoCommand } from '$lib/types';

	export let isAdmin = false;

	let videoElement: HTMLVideoElement;
	let ws: WebSocket;
	let ignoreSeek = false;

	onMount(() => {
		connectWebSocket();
	});

	onDestroy(() => {
		if (ws) ws.close();
	});

	function connectWebSocket() {
		ws = new WebSocket(`wss://${window.location.host}:3001/ws`);

		ws.onmessage = (event) => {
			const command: VideoCommand = JSON.parse(event.data);
			handleVideoCommand(command);
		};

		ws.onclose = () => {
			setTimeout(connectWebSocket, 3000);
		};
	}

	function handleVideoCommand(command: VideoCommand) {
		if (!videoElement) return;

		switch (command.type) {
			case 'play':
				videoElement.play();
				break;
			case 'pause':
				videoElement.pause();
				break;
			case 'seek':
				if (command.time !== undefined) {
					ignoreSeek = true;
					videoElement.currentTime = command.time;
				}
				break;
			case 'changeVideo':
				if (command.url) {
					videoElement.src = command.url;
				}
				break;
		}
	}

	function sendCommand(command: VideoCommand) {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(command));
		}
	}
</script>

<div class="mx-auto w-full max-w-4xl p-4">
	{#if isAdmin}
		<div class="mb-6 rounded-lg bg-white p-4 shadow">
			<h3 class="mb-4 text-lg font-semibold">管理员控制面板</h3>
			<div class="space-y-4">
				<div>
					<label for="videoUrl" class="block text-sm font-medium text-gray-700">
						WebDAV 视频地址
					</label>
					<input
						type="text"
						id="videoUrl"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
						placeholder="https://your-webdav-server.com/video.mp4"
						on:change={(e) => {
							sendCommand({
								type: 'changeVideo',
								url: e.currentTarget.value
							});
						}}
					/>
				</div>
			</div>
		</div>
	{/if}

	<div class="overflow-hidden rounded-lg bg-white shadow">
		<video
			bind:this={videoElement}
			class="aspect-video w-full"
			controls
			on:play={() => sendCommand({ type: 'play' })}
			on:pause={() => sendCommand({ type: 'pause' })}
			on:seeked={() => {
				if (!ignoreSeek) {
					sendCommand({
						type: 'seek',
						time: videoElement.currentTime
					});
				}
				ignoreSeek = false;
			}}
		>
			<track kind="captions" />
		</video>
	</div>
</div>
