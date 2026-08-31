package com.haru.todo;

import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class TodoService {
    private final TodoRepository repository;
    public TodoService(TodoRepository repository) { this.repository = repository; }

    public Page<Todo> findAll(int page, int size, String status, String query) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.ASC, "dueDate"));
        boolean hasQuery = query != null && !query.isBlank();
        if ("OPEN".equalsIgnoreCase(status)) {
            return hasQuery ? repository.findByCompletedAndTitleContainingIgnoreCaseOrCompletedAndContentContainingIgnoreCase(false, query, false, query, pageable) : repository.findByCompleted(false, pageable);
        }
        if ("COMPLETED".equalsIgnoreCase(status)) {
            return hasQuery ? repository.findByCompletedAndTitleContainingIgnoreCaseOrCompletedAndContentContainingIgnoreCase(true, query, true, query, pageable) : repository.findByCompleted(true, pageable);
        }
        return hasQuery ? repository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query, pageable) : repository.findAll(pageable);
    }

    @Transactional public Todo create(TodoRequest request) { return repository.save(new Todo(request.title(), request.content(), request.dueDate(), request.category())); }
    @Transactional public Todo update(Long id, TodoRequest request) { Todo todo = get(id); todo.update(request.title(), request.content(), request.dueDate(), request.category()); return todo; }
    @Transactional public Todo complete(Long id, CompleteRequest request) { Todo todo = get(id); todo.complete(request.completed()); return todo; }
    @Transactional public void delete(Long id) { repository.delete(get(id)); }
    private Todo get(Long id) { return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo를 찾을 수 없습니다.")); }

    public record TodoRequest(String title, String content, java.time.LocalDateTime dueDate, String category) {}
    public record CompleteRequest(boolean completed) {}
}
