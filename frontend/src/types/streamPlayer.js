/**
 * StreamPlayer Type Definitions
 * 다양한 스트리밍 프로토콜을 지원하는 플레이어의 타입 정의
 */
/**
 * 플레이어 상태
 */
export var PlayerState;
(function (PlayerState) {
    PlayerState["IDLE"] = "idle";
    PlayerState["LOADING"] = "loading";
    PlayerState["PLAYING"] = "playing";
    PlayerState["PAUSED"] = "paused";
    PlayerState["ERROR"] = "error";
    PlayerState["SEEKING"] = "seeking";
})(PlayerState || (PlayerState = {}));
/**
 * 플레이어 에러 타입
 */
export var PlayerErrorType;
(function (PlayerErrorType) {
    PlayerErrorType["NETWORK"] = "NETWORK_ERROR";
    PlayerErrorType["DECODE"] = "DECODE_ERROR";
    PlayerErrorType["ABORT"] = "ABORT_ERROR";
    PlayerErrorType["TIMEOUT"] = "TIMEOUT_ERROR";
    PlayerErrorType["NOT_SUPPORTED"] = "NOT_SUPPORTED_ERROR";
    PlayerErrorType["UNKNOWN"] = "UNKNOWN_ERROR";
})(PlayerErrorType || (PlayerErrorType = {}));
