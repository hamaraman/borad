package com.haru.todo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "todos", indexes = {@Index(name = "idx_todos_due_date", columnList = "due_date")})
public class Todo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String title;

    @Size(max = 2000)
    @Column(length = 2000)
    private String content;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(nullable = false)
    private boolean completed;

    @Size(max = 40)
    @Column(length = 40)
    private String category;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected Todo() {}
    public Todo(String title, String content, LocalDateTime dueDate, String category) {
        this.title = title; this.content = content; this.dueDate = dueDate; this.category = category; this.completed = false;
    }
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public LocalDateTime getDueDate() { return dueDate; }
    public boolean isCompleted() { return completed; }
    public String getCategory() { return category; }
    public void update(String title, String content, LocalDateTime dueDate, String category) { this.title = title; this.content = content; this.dueDate = dueDate; this.category = category; }
    public void complete(boolean completed) { this.completed = completed; }
}
