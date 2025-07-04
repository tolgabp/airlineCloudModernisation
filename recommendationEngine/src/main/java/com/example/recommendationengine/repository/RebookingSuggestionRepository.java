package com.example.recommendationengine.repository;

import com.example.recommendationengine.model.RebookingSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RebookingSuggestionRepository extends JpaRepository<RebookingSuggestion, Long> {
    
    List<RebookingSuggestion> findByDelayNotificationIdOrderByPriorityAsc(Long delayNotificationId);
    
    List<RebookingSuggestion> findByStatus(RebookingSuggestion.SuggestionStatus status);
    
    List<RebookingSuggestion> findByDelayNotificationIdAndStatus(Long delayNotificationId, RebookingSuggestion.SuggestionStatus status);
    
    void deleteByDelayNotificationId(Long delayNotificationId);
} 