package com.vision.service;

import com.vision.dto.LayoutDto;
import com.vision.entity.Layout;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.LayoutRepository;
import com.vision.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Layout Service - 개인화 그리드 레이아웃
 */
@Service
@RequiredArgsConstructor
public class LayoutService {

    private final LayoutRepository layoutRepository;
    private final UserAccountRepository userRepository;

    /**
     * 사용자 레이아웃 조회
     */
    @Transactional(readOnly = true)
    public LayoutDto getUserLayout(Long userId) {
        return layoutRepository.findFirstByUserIdOrderByIdAsc(userId)
                .map(LayoutDto::fromEntity)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public LayoutDto getMyLayout(String actorUsername) {
        UserAccount actor = resolveActor(actorUsername);
        return getUserLayout(actor.getId());
    }

    /**
     * 레이아웃 저장
     */
    @Transactional
    public LayoutDto saveLayout(LayoutDto layoutDto) {
        validateLayout(layoutDto);
        Layout layout = layoutDto.toEntity();
        layout.setCreatedAt(layout.getCreatedAt() == null ? LocalDateTime.now() : layout.getCreatedAt());
        layout.setUpdatedAt(LocalDateTime.now());
        return LayoutDto.fromEntity(layoutRepository.save(layout));
    }

    @Transactional
    public LayoutDto saveMyLayout(String actorUsername, LayoutDto layoutDto) {
        UserAccount actor = resolveActor(actorUsername);
        validateLayout(layoutDto);

        Layout existing = layoutRepository.findFirstByUserIdOrderByIdAsc(actor.getId()).orElse(null);
        Layout layout = layoutDto.toEntity();
        if (existing != null) {
            layout.setId(existing.getId());
            layout.setCreatedAt(existing.getCreatedAt());
        } else {
            layout.setId(null);
            layout.setCreatedAt(LocalDateTime.now());
        }
        layout.setUserId(actor.getId());
        layout.setUpdatedAt(LocalDateTime.now());

        Layout saved = layoutRepository.save(layout);
        layoutRepository.deleteByUserIdAndIdNot(actor.getId(), saved.getId());
        return LayoutDto.fromEntity(saved);
    }

    /**
     * 레이아웃 업데이트
     */
    @Transactional
    public LayoutDto updateLayout(Long id, LayoutDto layoutDto) {
        validateLayout(layoutDto);
        Layout existing = layoutRepository.findById(id)
                .orElseThrow(() -> new ApiException("LAYOUT_NOT_FOUND", "Layout not found"));
        Layout updated = layoutDto.toEntity();
        updated.setId(existing.getId());
        updated.setUserId(existing.getUserId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(LocalDateTime.now());
        return LayoutDto.fromEntity(layoutRepository.save(updated));
    }

    /**
     * 레이아웃 삭제
     */
    @Transactional
    public void deleteLayout(Long id) {
        layoutRepository.deleteById(id);
    }

    private UserAccount resolveActor(String actorUsername) {
        if (actorUsername == null || actorUsername.isBlank()) {
            throw new ApiException("AUTH_REQUIRED", "Authentication is required");
        }
        UserAccount actor = userRepository.findByUsernameIgnoreCase(actorUsername.trim())
                .orElseThrow(() -> new ApiException("AUTH_REQUIRED", "Authentication is required"));
        if (!Boolean.TRUE.equals(actor.getEnabled())) {
            throw new ApiException("AUTH_REQUIRED", "Authentication is required");
        }
        return actor;
    }

    private void validateLayout(LayoutDto layoutDto) {
        if (layoutDto == null || layoutDto.getTabs() == null || !layoutDto.getTabs().isArray() || layoutDto.getTabs().isEmpty()) {
            throw new ApiException("INVALID_LAYOUT", "Layout payload is invalid", new InvalidLayoutDetail("tabs", "At least one tab is required"));
        }
        if (layoutDto.getActiveTab() == null || layoutDto.getActiveTab().isBlank()) {
            throw new ApiException("INVALID_LAYOUT", "Layout payload is invalid", new InvalidLayoutDetail("activeTab", "Active tab is required"));
        }
    }

    private record InvalidLayoutDetail(String field, String reason) {
    }

}
