/**
 * HLSPlayer - HLS/m3u8 스트림 플레이어 구현
 * Video.js 및 hls.js 기반
 */
import Hls from 'hls.js';
import { StreamPlayer } from './StreamPlayer';
/**
 * HLS 플레이어 구현 클래스
 */
export class HLSPlayer extends StreamPlayer {
    constructor(videoElement, url, reconnectConfig) {
        super(url, reconnectConfig);
        Object.defineProperty(this, "videoElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "hlsInstance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "qualityLevels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "currentQualityLevel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: -1
        });
        this.videoElement = videoElement;
        this.setupVideoElement();
        this.setupHLS();
    }
    /**
     * 비디오 요소 설정
     */
    setupVideoElement() {
        if (!this.videoElement)
            return;
        this.videoElement.addEventListener('play', () => this.setState('playing'));
        this.videoElement.addEventListener('pause', () => this.setState('paused'));
        this.videoElement.addEventListener('seeking', () => this.setState('seeking'));
        this.videoElement.addEventListener('seeked', () => {
            if (this.state === 'seeking') {
                this.emit('seek', { currentTime: this.videoElement.currentTime });
            }
        });
        this.videoElement.addEventListener('ended', () => {
            this.setState('idle');
            this.emit('ended', {});
        });
        this.videoElement.addEventListener('timeupdate', () => {
            this.emit('timeupdate', {
                currentTime: this.videoElement.currentTime,
                duration: this.videoElement.duration,
            });
        });
        this.videoElement.addEventListener('durationchange', () => {
            this.emit('durationchange', { duration: this.videoElement.duration });
        });
        this.videoElement.addEventListener('volumechange', () => {
            this.emit('volumechange', {
                volume: this.videoElement.volume,
                muted: this.videoElement.muted,
            });
        });
        this.videoElement.addEventListener('error', (e) => {
            const mediaError = e.target.error;
            if (mediaError) {
                this.handleError({
                    type: 'NETWORK_ERROR',
                    message: `Media error: ${mediaError.message}`,
                    code: mediaError.code,
                });
            }
        });
    }
    /**
     * HLS 설정
     */
    setupHLS() {
        if (!this.videoElement)
            return;
        if (Hls.isSupported()) {
            this.hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
            });
            this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                this.setState('loading');
                this.loadQualityLevels();
                this.emit('loadend', {});
            });
            this.hlsInstance.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
                const quality = this.qualityLevels[data.level];
                if (quality) {
                    this.currentQualityLevel = data.level;
                    this.emit('qualitychange', quality);
                }
            });
            this.hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                const errorType = data.type;
                const message = data.details || 'Unknown HLS error';
                if (data.fatal) {
                    let playerError;
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        playerError = {
                            type: 'NETWORK_ERROR',
                            message: `Network error: ${message}`,
                            code: data.response?.status,
                        };
                    }
                    else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        playerError = {
                            type: 'DECODE_ERROR',
                            message: `Media error: ${message}`,
                        };
                    }
                    else {
                        playerError = {
                            type: 'UNKNOWN_ERROR',
                            message: message,
                        };
                    }
                    this.handleError(playerError);
                }
            });
            this.hlsInstance.loadSource(this.url);
            if (this.videoElement) {
                this.hlsInstance.attachMedia(this.videoElement);
            }
        }
        else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS support
            this.videoElement.src = this.url;
        }
    }
    /**
     * 품질 레벨 로드
     */
    loadQualityLevels() {
        if (!this.hlsInstance || !this.hlsInstance.levels)
            return;
        this.qualityLevels = this.hlsInstance.levels.map((level, index) => ({
            level: index,
            width: level.width || 0,
            height: level.height || 0,
            bitrate: level.bitrate || 0,
            name: `${level.height}p`,
        }));
        this.emit('durationchange', {
            qualityLevels: this.qualityLevels,
        });
    }
    /**
     * 재생
     */
    async play() {
        if (!this.videoElement) {
            throw new Error('Video element not initialized');
        }
        try {
            this.setState('loading');
            this.emit('loadstart', {});
            await this.videoElement.play();
            this.cancelReconnect();
        }
        catch (error) {
            this.handleError({
                type: 'ABORT_ERROR',
                message: 'Failed to play video',
                original: error,
            });
            throw error;
        }
    }
    /**
     * 일시정지
     */
    pause() {
        if (!this.videoElement)
            return;
        this.videoElement.pause();
        this.setState('paused');
        this.emit('pause', {});
    }
    /**
     * 시간 이동
     */
    seek(time) {
        if (!this.videoElement)
            return;
        this.videoElement.currentTime = Math.max(0, Math.min(time, this.videoElement.duration));
    }
    /**
     * 볼륨 설정
     */
    setVolume(volume) {
        if (!this.videoElement)
            return;
        this.videoElement.volume = Math.max(0, Math.min(1, volume));
    }
    /**
     * 음소거 설정
     */
    setMuted(muted) {
        if (!this.videoElement)
            return;
        this.videoElement.muted = muted;
    }
    /**
     * 재생 속도 설정
     */
    setPlaybackRate(rate) {
        if (!this.videoElement)
            return;
        this.videoElement.playbackRate = Math.max(0.25, Math.min(2, rate));
    }
    /**
     * 품질 변경
     */
    setQuality(levelIndex) {
        if (!this.hlsInstance || levelIndex < 0 || levelIndex >= this.qualityLevels.length) {
            return;
        }
        this.hlsInstance.currentLevel = levelIndex;
    }
    /**
     * 자동 품질 조절 설정
     */
    setAutoQuality(enabled) {
        if (!this.hlsInstance)
            return;
        if (enabled) {
            this.hlsInstance.currentLevel = -1;
        }
    }
    /**
     * 사용 가능한 품질 조회
     */
    getQualityLevels() {
        return this.qualityLevels;
    }
    /**
     * 현재 품질 조회
     */
    getCurrentQuality() {
        if (this.currentQualityLevel < 0 || this.currentQualityLevel >= this.qualityLevels.length) {
            return null;
        }
        return this.qualityLevels[this.currentQualityLevel];
    }
    /**
     * 통계 정보
     */
    getStats() {
        if (!this.videoElement) {
            return {
                currentTime: 0,
                duration: 0,
                buffered: { start: 0, end: 0 },
                volume: 0,
                muted: false,
                playbackRate: 1,
            };
        }
        const bufferedRanges = [];
        const buffered = this.videoElement.buffered;
        for (let i = 0; i < buffered.length; i++) {
            bufferedRanges.push({
                start: buffered.start(i),
                end: buffered.end(i),
            });
        }
        const currentQuality = this.getCurrentQuality();
        return {
            currentTime: this.videoElement.currentTime,
            duration: this.videoElement.duration,
            buffered: bufferedRanges,
            volume: this.videoElement.volume,
            muted: this.videoElement.muted,
            playbackRate: this.videoElement.playbackRate,
            width: currentQuality?.width,
            height: currentQuality?.height,
            bitrate: currentQuality?.bitrate,
        };
    }
    /**
     * 리소스 해제
     */
    destroy() {
        this.cancelReconnect();
        if (this.videoElement) {
            this.videoElement.src = '';
        }
        if (this.hlsInstance) {
            this.hlsInstance.destroy();
            this.hlsInstance = null;
        }
        this.videoElement = null;
        this.listeners.clear();
    }
}
