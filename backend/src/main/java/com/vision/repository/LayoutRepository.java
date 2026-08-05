package com.vision.repository;

import com.vision.entity.Layout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Layout Repository - 개인화 그리드 레이아웃용
 */
@Repository
public interface LayoutRepository extends JpaRepository<Layout, Long> {

    Optional<Layout> findByUserId(Long userId);

    List<Layout> findAllByUserId(Long userId);

}
