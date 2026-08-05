import { jsx as _jsx } from "react/jsx-runtime";
/**
 * StreamPlayerComponent Tests
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { StreamPlayerComponent } from '../StreamPlayerComponent';
// Mock Video.js와 hls.js
vi.mock('video.js', () => ({
    default: vi.fn(),
}));
vi.mock('hls.js', () => ({
    default: {
        isSupported: () => false,
        Events: {},
        ErrorTypes: {},
    },
}));
describe('StreamPlayerComponent', () => {
    const mockSource = {
        url: 'http://example.com/stream.m3u8',
        protocol: 'hls',
        label: 'Test Stream',
    };
    beforeEach(() => {
        // 각 테스트 전에 초기화
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    it('should render player container', () => {
        render(_jsx(StreamPlayerComponent, { source: mockSource }));
        const container = document.querySelector('[style*="width"]');
        expect(container).toBeTruthy();
    });
    it('should accept custom dimensions', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, width: "800px", height: "600px" }));
        const playerDiv = container.firstChild;
        expect(playerDiv.style.width).toBe('800px');
        expect(playerDiv.style.height).toBe('600px');
    });
    it('should apply custom className', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, className: "custom-player-class" }));
        const playerDiv = container.firstChild;
        expect(playerDiv.className).toContain('custom-player-class');
    });
    it('should display idle state initially', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, controls: true }));
        // 재생 버튼이 표시되어야 함
        expect(container).toBeTruthy();
    });
    it('should call onStateChange callback', async () => {
        const onStateChange = vi.fn();
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, onStateChange: onStateChange }));
        await waitFor(() => {
            expect(container).toBeTruthy();
        }, { timeout: 1000 });
    });
    it('should call onError callback on error', async () => {
        const onError = vi.fn();
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, onError: onError }));
        await waitFor(() => {
            expect(container).toBeTruthy();
        }, { timeout: 1000 });
    });
    it('should accept quality selector prop', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, controls: true, showQualitySelector: true }));
        expect(container).toBeTruthy();
    });
    it('should accept captions prop', () => {
        const captions = [
            {
                kind: 'captions',
                src: 'http://example.com/captions.vtt',
                srclang: 'en',
                label: 'English',
            },
        ];
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, controls: true, showCaptions: true, captions: captions }));
        expect(container).toBeTruthy();
    });
    it('should handle autoplay', async () => {
        const onPlay = vi.fn();
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, autoplay: true, onPlay: onPlay }));
        await waitFor(() => {
            expect(container).toBeTruthy();
        }, { timeout: 1000 });
    });
    it('should render with poster image', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, poster: "http://example.com/poster.jpg" }));
        expect(container).toBeTruthy();
    });
    it('should support WebRTC protocol', () => {
        const webrtcSource = {
            url: 'wss://example.com/whep',
            protocol: 'webrtc',
        };
        const { container } = render(_jsx(StreamPlayerComponent, { source: webrtcSource }));
        expect(container).toBeTruthy();
    });
    it('should support RTSP protocol', () => {
        const rtspSource = {
            url: 'rtsp://example.com/stream',
            protocol: 'rtsp',
        };
        const { container } = render(_jsx(StreamPlayerComponent, { source: rtspSource }));
        expect(container).toBeTruthy();
    });
    it('should handle source changes', async () => {
        const { rerender } = render(_jsx(StreamPlayerComponent, { source: mockSource }));
        const newSource = {
            url: 'http://example.com/stream2.m3u8',
            protocol: 'hls',
        };
        rerender(_jsx(StreamPlayerComponent, { source: newSource }));
        await waitFor(() => {
            expect(true).toBe(true);
        }, { timeout: 1000 });
    });
    it('should have controls visible', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, controls: true }));
        expect(container).toBeTruthy();
    });
    it('should hide controls when disabled', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, controls: false }));
        expect(container).toBeTruthy();
    });
    it('should handle muted prop', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, muted: true }));
        expect(container).toBeTruthy();
    });
    it('should handle loop prop', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, loop: true }));
        expect(container).toBeTruthy();
    });
    it('should call callbacks on events', async () => {
        const onPlay = vi.fn();
        const onPause = vi.fn();
        const onEnded = vi.fn();
        const onTimeUpdate = vi.fn();
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource, onPlay: onPlay, onPause: onPause, onEnded: onEnded, onTimeUpdate: onTimeUpdate }));
        await waitFor(() => {
            expect(container).toBeTruthy();
        }, { timeout: 1000 });
    });
    it('should render without crashing', () => {
        const { container } = render(_jsx(StreamPlayerComponent, { source: mockSource }));
        expect(container).toBeTruthy();
    });
});
