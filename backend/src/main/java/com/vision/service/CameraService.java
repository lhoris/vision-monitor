package com.vision.service;

import com.vision.dto.CameraDto;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Camera Service
 * Phase 3에서 구현
 */
@Service
public class CameraService {

    /**
     * 모든 카메라 조회
     * Phase 3에서 구현
     */
    public List<CameraDto> getAllCameras() {
        // TODO: Phase 3에서 구현
        return List.of();
    }

    /**
     * 카메라 상세 조회
     * Phase 3에서 구현
     */
    public CameraDto getCamera(Long id) {
        // TODO: Phase 3에서 구현
        return null;
    }

    /**
     * 카메라 생성
     * Phase 3에서 구현
     */
    public CameraDto createCamera(CameraDto cameraDto) {
        // TODO: Phase 3에서 구현
        return cameraDto;
    }

    /**
     * 카메라 업데이트
     * Phase 3에서 구현
     */
    public CameraDto updateCamera(Long id, CameraDto cameraDto) {
        // TODO: Phase 3에서 구현
        return cameraDto;
    }

    /**
     * 카메라 삭제
     * Phase 3에서 구현
     */
    public void deleteCamera(Long id) {
        // TODO: Phase 3에서 구현
    }

}
