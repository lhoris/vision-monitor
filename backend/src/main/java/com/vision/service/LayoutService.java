package com.vision.service;

import com.vision.dto.LayoutDto;
import org.springframework.stereotype.Service;

/**
 * Layout Service - 개인화 그리드 레이아웃
 */
@Service
public class LayoutService {

    /**
     * 사용자 레이아웃 조회
     */
    public LayoutDto getUserLayout(Long userId) {
        // TODO: Phase 3에서 구현
        return null;
    }

    /**
     * 레이아웃 저장
     */
    public LayoutDto saveLayout(LayoutDto layoutDto) {
        // TODO: Phase 3에서 구현
        return layoutDto;
    }

    /**
     * 레이아웃 업데이트
     */
    public LayoutDto updateLayout(Long id, LayoutDto layoutDto) {
        // TODO: Phase 3에서 구현
        return layoutDto;
    }

    /**
     * 레이아웃 삭제
     */
    public void deleteLayout(Long id) {
        // TODO: Phase 3에서 구현
    }

}
