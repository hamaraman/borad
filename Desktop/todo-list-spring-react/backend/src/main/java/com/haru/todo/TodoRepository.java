package com.haru.todo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    Page<Todo> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title, String content, Pageable pageable);
    Page<Todo> findByCompleted(boolean completed, Pageable pageable);
    Page<Todo> findByCompletedAndTitleContainingIgnoreCaseOrCompletedAndContentContainingIgnoreCase(boolean completed1, String title, boolean completed2, String content, Pageable pageable);
}
