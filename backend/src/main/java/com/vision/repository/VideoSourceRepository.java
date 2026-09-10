package com.vision.repository;

import com.vision.entity.VideoSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoSourceRepository extends JpaRepository<VideoSource, Long> {
    boolean existsByUrlIgnoreCase(String url);
    Optional<VideoSource> findByUrlIgnoreCase(String url);
}
