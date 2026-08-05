/**
 * RTSPPlayer - RTSP 스트림 플레이어 구현
 * JSMpeg을 이용한 RTSP-over-WebSocket 재생
 */
import { StreamPlayer } from './StreamPlayer';
/**
 * RTSP 플레이어 구현 클래스
 */
export class RTSPPlayer extends StreamPlayer {
    constructor(canvasElement, url, reconnectConfig) {
        super(url, reconnectConfig);
        Object.defineProperty(this, "canvasElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "jsmpegPlayer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "wsUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.canvasElement = canvasElement;
        this.wsUrl = this.rtspToWebSocketUrl(url);
        this.setupCanvas();
    }
    /**
     * RTSP URL을 WebSocket URL로 변환
     * rtsp://host:port/path -> ws://host:ws-port/path
     */
    rtspToWebSocketUrl(rtspUrl) {
        try {
            const url = new URL(rtspUrl);
            // WebSocket 포트는 일반적으로 8081
            return `ws://${url.hostname}:8081${url.pathname}`;
        }
        catch {
            // 간단한 문자열 변환
            return rtspUrl
                .replace(/^rtsp:\/\//, 'ws://')
                .replace(/:554/, ':8081');
        }
    }
    /**
     * Canvas 요소 설정
     */
    setupCanvas() {
        if (!this.canvasElement)
            return;
        // Canvas 크기 설정
        this.canvasElement.width = 1920;
        this.canvasElement.height = 1080;
        // 클릭 시 전체화면
        this.canvasElement.addEventListener('click', () => {
            if (this.canvasElement) {
                if (this.canvasElement.requestFullscreen) {
                    this.canvasElement.requestFullscreen();
                }
            }
        });
    }
    /**
     * JSMpeg 플레이어 초기화
     */
    async initializeJSMpeg() {
        if (!this.canvasElement) {
            throw new Error('Canvas element not initialized');
        }
        try {
            // JSMpeg 라이브러리 동적 로드
            const JSMpegModule = await this.loadJSMpeg();
            this.jsmpegPlayer = new JSMpegModule.Player(this.wsUrl, {
                canvas: this.canvasElement,
                autoplay: false,
                loop: false,
                audioContext: new AudioContext(),
                onPlay: () => {
                    this.setState('playing');
                    this.emit('play', {});
                },
                onPause: () => {
                    this.setState('paused');
                    this.emit('pause', {});
                },
                onError: (error) => {
                    this.handleError({
                        type: 'DECODE_ERROR',
                        message: `JSMpeg error: ${error.message}`,
                        original: error,
                    });
                },
                onStalled: () => {
                    this.emit('buffering', {});
                },
            });
            this.emit('loadend', {});
        }
        catch (error) {
            this.handleError({
                type: 'NOT_SUPPORTED_ERROR',
                message: 'Failed to initialize JSMpeg player',
                original: error,
            });
            throw error;
        }
    }
    /**
     * JSMpeg 라이브러리 동적 로드
     */
    async loadJSMpeg() {
        // 이미 로드된 경우
        if (window.JSMpeg) {
            return window.JSMpeg;
        }
        // CDN에서 로드
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://jsmpeg.com/jsmpeg.min.js';
            script.onload = () => {
                resolve(window.JSMpeg);
            };
            script.onerror = () => {
                reject(new Error('Failed to load JSMpeg library'));
            };
            document.head.appendChild(script);
        });
    }
    /**
     * 재생
     */
    async play() {
        try {
            if (!this.jsmpegPlayer) {
                await this.initializeJSMpeg();
            }
            this.setState('loading');
            this.emit('loadstart', {});
            this.jsmpegPlayer?.play();
            this.cancelReconnect();
        }
        catch (error) {
            this.handleError({
                type: 'ABORT_ERROR',
                message: 'Failed to play RTSP stream',
                original: error,
            });
            throw error;
        }
    }
    /**
     * 일시정지
     */
    pause() {
        this.jsmpegPlayer?.pause();
        this.setState('paused');
        this.emit('pause', {});
    }
    /**
     * 시간 이동
     */
    seek(time) {
        // RTSP는 시간 이동을 지원하지 않음
        console.warn('Seeking is not supported for RTSP streams');
    }
    /**
     * 볼륨 설정
     */
    setVolume(volume) {
        if (!this.jsmpegPlayer)
            return;
        this.jsmpegPlayer.volume = Math.max(0, Math.min(1, volume));
    }
    /**
     * 음소거 설정
     */
    setMuted(muted) {
        if (!this.jsmpegPlayer)
            return;
        this.jsmpegPlayer.volume = muted ? 0 : 1;
    }
    /**
     * 재생 속도 설정
     */
    setPlaybackRate(rate) {
        // RTSP는 재생 속도 조절을 지원하지 않음
        console.warn('Playback rate adjustment is not supported for RTSP streams');
    }
    /**
     * 통계 정보
     */
    getStats() {
        return {
            currentTime: this.jsmpegPlayer?.currentTime || 0,
            duration: 0,
            buffered: { start: 0, end: 0 },
            volume: this.jsmpegPlayer?.volume || 0,
            muted: (this.jsmpegPlayer?.volume || 0) === 0,
            playbackRate: 1,
            width: this.canvasElement?.width,
            height: this.canvasElement?.height,
        };
    }
    /**
     * 리소스 해제
     */
    destroy() {
        this.cancelReconnect();
        if (this.jsmpegPlayer) {
            this.jsmpegPlayer.stop();
            this.jsmpegPlayer.destroy();
            this.jsmpegPlayer = null;
        }
        if (this.canvasElement) {
            this.canvasElement.width = 0;
            this.canvasElement.height = 0;
        }
        this.canvasElement = null;
        this.listeners.clear();
    }
}
