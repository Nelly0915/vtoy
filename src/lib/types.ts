export interface VideoCommand {
	type: 'play' | 'pause' | 'seek' | 'changeVideo';
	url?: string;
	time?: number;
}

export interface VideoState {
	currentVideo: string | null;
	isPlaying: boolean;
	currentTime: number;
}