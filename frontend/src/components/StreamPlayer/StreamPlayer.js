/**
 * StreamPlayer - Abstract Base Class
 * 다양한 스트리밍 프로토콜을 지원하는 추상 플레이어
 */
/**
 * 스트림 플레이어 추상 클래스
 * 모든 플레이어 구현의 기본 인터페이스 제공
 */
export class StreamPlayer {
    constructor(url, reconnectConfig) {
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'idle'
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "reconnectConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "reconnectTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.url = url;
        this.reconnectConfig = reconnectConfig || {
            enabled: true,
            maxAttempts: 5,
            initialDelay: 1000,
            maxDelay: 30000,
            backoffFactor: 2,
        };
    }
    /**
     * 이벤트 리스너 등록
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }
    /**
     * 이벤트 리스너 제거
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }
    /**
     * 이벤트 발생
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }
    /**
     * 플레이어 상태 변경
     */
    setState(state) {
        if (this.state !== state) {
            this.state = state;
            this.emit('timeupdate', { state });
        }
    }
    /**
     * 에러 처리
     */
    handleError(error) {
        console.error('Player error:', error);
        this.setState('error');
        this.emit('error', error);
        if (this.reconnectConfig.enabled) {
            this.attemptReconnect();
        }
    }
    /**
     * 자동 재연결 로직
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.reconnectConfig.maxAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectConfig.initialDelay *
            Math.pow(this.reconnectConfig.backoffFactor, this.reconnectAttempts - 1), this.reconnectConfig.maxDelay);
        this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });
        this.reconnectTimer = setTimeout(() => {
            console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.reconnectConfig.maxAttempts})`);
            this.play()
                .then(() => {
                this.reconnectAttempts = 0;
                this.emit('reconnected', {});
            })
                .catch((error) => {
                this.attemptReconnect();
            });
        }, delay);
    }
    /**
     * 재연결 타이머 취소
     */
    cancelReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.reconnectAttempts = 0;
    }
    /**
     * 현재 상태 반환
     */
    getState() {
        return this.state;
    }
}
