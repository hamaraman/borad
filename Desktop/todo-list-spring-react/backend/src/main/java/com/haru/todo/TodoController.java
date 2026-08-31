package com.haru.todo;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@RestController
@RequestMapping("/api/todos")
public class TodoController {
    private final TodoService service;
    public TodoController(TodoService service) { this.service = service; }

    @GetMapping public Page<Todo> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "all") String status, @RequestParam(required = false) String query) { return service.findAll(page, size, status, query); }
    @PostMapping public ResponseEntity<Todo> create(@Valid @RequestBody TodoService.TodoRequest request) { Todo todo = service.create(request); return ResponseEntity.created(URI.create("/api/todos/" + todo.getId())).body(todo); }
    @PutMapping("/{id}") public Todo update(@PathVariable Long id, @Valid @RequestBody TodoService.TodoRequest request) { return service.update(id, request); }
    @PatchMapping("/{id}/complete") public Todo complete(@PathVariable Long id, @RequestBody TodoService.CompleteRequest request) { return service.complete(id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
