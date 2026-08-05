/**
 * useStreamPlayer - React Hook for StreamPlayer
 * 플레이어 생명주기 및 상태 관리
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { HLSPlayer } from './HLSPlayer';
import { WebRTCPlayer } from './WebRTCPlayer';
import { RTSPPlayer } from './RTSPPlayer';
/**
 * 스트림 프로토콜 자동 감지
 */
function detectProtocol(url) {
    if (url.includes('.m3u8'))
        return 'hls';
    if (url.includes('ws://') || url.includes('wss://'))
        return 'webrtc';
    if (url.includes('rtsp://'))
        return 'rtsp';
    if (url.includes('http://') || url.includes('https://'))
        return 'hls';
    return 'unknown';
}
/**
 * StreamPlayer를 관리하는 React Hook
 */
export function useStreamPlayer(containerRef, source, config) {
    const playerRef = useRef(null);
    const videoElementRef = useRef(null);
    const canvasElementRef = useRef(null);
    const [state, setState] = useState('idle');
    const [stats, setStats] = useState({
        currentTime: 0,
        duration: 0,
        buffered: { start: 0, end: 0 },
        volume: 1,
        muted: false,
        playbackRate: 1,
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [qualityLevels, setQualityLevels] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(null);
    const protocol = source.protocol || detectProtocol(source.url);
    /**
     * 플레이어 생성 및 초기화
     */
    const initializePlayer = useCallback(async () => {
        if (!containerRef.current)
            return;
        try {
            // 기존 플레이어 정리
            if (playerRef.current) {
                if (playerRef.current instanceof WebRTCPlayer) {
                    await playerRef.current.destroy();
                }
                else {
                    playerRef.current.destroy();
                }
                playerRef.current = null;
            }
            // 프로토콜별 플레이어 생성
            switch (protocol) {
                case 'hls': {
                    if (!videoElementRef.current) {
                        videoElementRef.current = document.createElement('video');
                        videoElementRef.current.style.width = '100%';
                        videoElementRef.current.style.height = '100%';
                        videoElementRef.current.style.objectFit = 'contain';
                        videoElementRef.current.controls = true;
                        containerRef.current.appendChild(videoElementRef.current);
                    }
                    playerRef.current = new HLSPlayer(videoElementRef.current, source.url, config?.reconnect);
                    break;
                }
                case 'webrtc': {
                    if (!videoElementRef.current) {
                        videoElementRef.current = document.createElement('video');
                        videoElementRef.current.style.width = '100%';
                        videoElementRef.current.style.height = '100%';
                        videoElementRef.current.style.objectFit = 'contain';
                        videoElementRef.current.autoplay = true;
                        videoElementRef.current.playsinline = true;
                        containerRef.current.appendChild(videoElementRef.current);
                    }
                    playerRef.current = new WebRTCPlayer(videoElementRef.current, source.url, config?.webrtc, config?.reconnect);
                    break;
                }
                case 'rtsp': {
                    if (!canvasElementRef.current) {
                        canvasElementRef.current = document.createElement('canvas');
                        canvasElementRef.current.style.width = '100%';
                        canvasElementRef.current.style.height = '100%';
                        containerRef.current.appendChild(canvasElementRef.current);
                    }
                    playerRef.current = new RTSPPlayer(canvasElementRef.current, source.url, config?.reconnect);
                    break;
                }
                default:
                    throw new Error(`Unsupported protocol: ${protocol}`);
            }
            // 플레이어 이벤트 등록
            setupPlayerListeners();
            setError(null);
        }
        catch (err) {
            const playerError = {
                type: 'UNKNOWN_ERROR',
                message: err instanceof Error ? err.message : 'Failed to initialize player',
                original: err instanceof Error ? err : undefined,
            };
            setError(playerError);
            console.error('Player initialization error:', err);
        }
    }, [protocol, source.url, config, containerRef]);
    /**
     * 플레이어 이벤트 리스너 설정
     */
    const setupPlayerListeners = useCallback(() => {
        if (!playerRef.current)
            return;
        const player = playerRef.current;
        // 상태 변경
        player.on('loadstart', () => setIsLoading(true));
        player.on('loadend', () => setIsLoading(false));
        player.on('timeupdate', (data) => {
            setState(data.state || player.getState());
            setStats(player.getStats());
        });
        player.on('buffering', () => setIsLoading(true));
        player.on('buffered', () => setIsLoading(false));
        // 에러 처리
        player.on('error', (error) => {
            setError(error);
            console.error('Player error:', error);
        });
        // HLS 품질 변경
        if (playerRef.current instanceof HLSPlayer) {
            const hlsPlayer = playerRef.current;
            player.on('durationchange', (data) => {
                if (data.qualityLevels) {
                    setQualityLevels(data.qualityLevels);
                }
            });
            player.on('qualitychange', (quality) => {
                setCurrentQuality(quality);
            });
        }
        // 통계 업데이트
        const statsInterval = setInterval(() => {
            setStats(player.getStats());
        }, 1000);
        return () => clearInterval(statsInterval);
    }, []);
    /**
     * 초기화
     */
    useEffect(() => {
        initializePlayer();
        return () => {
            if (playerRef.current) {
                if (playerRef.current instanceof WebRTCPlayer) {
                    playerRef.current.destroy();
                }
                else {
                    playerRef.current.destroy();
                }
            }
        };
    }, [initializePlayer]);
    /**
     * 플레이어 메서드 래핑
     */
    const play = useCallback(async () => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        await playerRef.current.play();
    }, []);
    const pause = useCallback(() => {
        if (!playerRef.current)
            return;
        playerRef.current.pause();
    }, []);
    const seek = useCallback((time) => {
        if (!playerRef.current)
            return;
        playerRef.current.seek(time);
    }, []);
    const setVolume = useCallback((volume) => {
        if (!playerRef.current)
            return;
        playerRef.current.setVolume(volume);
        setStats((prev) => ({ ...prev, volume }));
    }, []);
    const setMuted = useCallback((muted) => {
        if (!playerRef.current)
            return;
        playerRef.current.setMuted(muted);
        setStats((prev) => ({ ...prev, muted }));
    }, []);
    const setPlaybackRate = useCallback((rate) => {
        if (!playerRef.current)
            return;
        playerRef.current.setPlaybackRate(rate);
        setStats((prev) => ({ ...prev, playbackRate: rate }));
    }, []);
    const setQuality = useCallback((levelIndex) => {
        if (playerRef.current instanceof HLSPlayer) {
            const hlsPlayer = playerRef.current;
            hlsPlayer.setQuality(levelIndex);
        }
    }, []);
    const getWebRTCStats = useCallback(async () => {
        if (playerRef.current instanceof WebRTCPlayer) {
            return await playerRef.current.getWebRTCStats();
        }
        return {};
    }, []);
    const on = useCallback((event, callback) => {
        if (!playerRef.current)
            return;
        playerRef.current.on(event, callback);
    }, []);
    const off = useCallback((event, callback) => {
        if (!playerRef.current)
            return;
        playerRef.current.off(event, callback);
    }, []);
    return {
        state,
        stats,
        error,
        player: playerRef.current,
        isLoading,
        qualityLevels,
        currentQuality,
        play,
        pause,
        seek,
        setVolume,
        setMuted,
        setPlaybackRate,
        setQuality,
        getWebRTCStats,
        on,
        off,
    };
}
