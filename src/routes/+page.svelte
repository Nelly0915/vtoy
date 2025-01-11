<script lang="ts">
	import { onMount } from 'svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';

	let isAdmin = false;
	let showLogin = true;

	const ADMIN_PASSWORD = '123456'; // 实际应用中应该从服务器获取

	function login(password: string) {
		if (password === ADMIN_PASSWORD) {
			isAdmin = true;
			showLogin = false;
		} else {
			alert('密码错误！');
		}
	}

	function loginAsGuest() {
		isAdmin = false;
		showLogin = false;
	}
</script>

{#if showLogin}
	<div class="flex min-h-screen items-center justify-center bg-gray-100">
		<div class="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow">
			<div>
				<h2 class="text-center text-3xl font-extrabold text-gray-900">视频播放系统</h2>
			</div>
			<form class="mt-8 space-y-6" on:submit|preventDefault>
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">
						管理员密码 (可选)
					</label>
					<input
						id="password"
						type="password"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>
				<div class="flex space-x-4">
					<button
						type="button"
						class="flex-1 justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						on:click={() => login(document.getElementById('password')?.value || '')}
					>
						管理员登录
					</button>
					<button
						type="button"
						class="flex-1 justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
						on:click={loginAsGuest}
					>
						游客访问
					</button>
				</div>
			</form>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-100 py-6">
		<VideoPlayer {isAdmin} />
	</div>
{/if}
