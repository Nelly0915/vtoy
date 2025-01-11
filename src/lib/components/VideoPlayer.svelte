<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { throttle } from '$lib/utils';
	import type { VideoCommand } from '$lib/types';

	export let isAdmin = false;

	let videoElement: HTMLVideoElement;
	let ws: WebSocket;
	let isProcessingCommand = false;
	let lastCommandTime = 0;
	let lastCommandType: string | null = null;

	onMount(() => {
		connectWebSocket();
	});

	onDestroy(() => {
		if (ws) ws.close();
	});

	function connectWebSocket() {
		ws = new WebSocket(`wss://vtoy.icechen.cn:8080/ws`);

		ws.onmessage = (event) => {
			const command: VideoCommand = JSON.parse(event.data);
			handleVideoCommand(command);
		};

		ws.onclose = () => {
			setTimeout(connectWebSocket, 3000);
		};
	}

	// 防止命令重复执行
	function shouldProcessCommand(command: VideoCommand): boolean {
		const currentTime = Date.now();
		const timeDiff = currentTime - lastCommandTime;

		// 如果是相同类型的命令且间隔小于500ms，则忽略
		if (command.type === lastCommandType && timeDiff < 500) {
			return false;
		}

		lastCommandTime = currentTime;
		lastCommandType = command.type;
		return true;
	}

	async function handleVideoCommand(command: VideoCommand) {
		if (!videoElement || isProcessingCommand || !shouldProcessCommand(command)) return;

		try {
			isProcessingCommand = true;

			switch (command.type) {
				case 'play':
					if (videoElement.paused) {
						await videoElement.play();
					}
					break;

				case 'pause':
					if (!videoElement.paused) {
						videoElement.pause();
					}
					break;

				case 'seek':
					if (command.time !== undefined) {
						const timeDiff = Math.abs(videoElement.currentTime - command.time);
						// 只有时间差大于0.5秒才进行跳转
						if (timeDiff > 0.5) {
							videoElement.currentTime = command.time;
						}
					}
					break;

				case 'changeVideo':
					if (command.url) {
						videoElement.src = command.url;
					}
					break;
			}
		} finally {
			// 确保在命令处理完后释放锁
			setTimeout(() => {
				isProcessingCommand = false;
			}, 100);
		}
	}

	// 使用节流处理进度更新
	const throttledSendCommand = throttle((command: VideoCommand) => {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(command));
		}
	}, 500);

	function sendCommand(command: VideoCommand) {
		if (command.type === 'seek') {
			throttledSendCommand(command);
		} else {
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(command));
			}
		}
	}

	// 使用 let 绑定存储上一次的时间
	let lastSeekTime = 0;

	function handleSeek() {
		const currentTime = Date.now();
		// 确保两次 seek 事件间隔至少 500ms
		if (currentTime - lastSeekTime > 500) {
			lastSeekTime = currentTime;
			sendCommand({
				type: 'seek',
				time: videoElement.currentTime
			});
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
			on:play={() => {
				if (!isProcessingCommand) {
					sendCommand({ type: 'play' });
				}
			}}
			on:pause={() => {
				if (!isProcessingCommand) {
					sendCommand({ type: 'pause' });
				}
			}}
			on:seeked={handleSeek}
		>
			<track kind="captions" />
		</video>
	</div>
</div>
