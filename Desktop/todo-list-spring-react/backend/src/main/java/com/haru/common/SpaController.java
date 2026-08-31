package com.haru.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class SpaController {

    @Value("${app.frontend.path:./dist/public}")
    private String frontendPath;

    @GetMapping("/")
    public ResponseEntity<Resource> serveIndex() throws IOException {
        return serveHtml("index.html");
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Resource> serveFavicon() throws IOException {
        return serveHtml("index.html");
    }

    private ResponseEntity<Resource> serveHtml(String fileName) throws IOException {
        Path indexPath = Path.of(frontendPath, fileName);
        if (Files.exists(indexPath)) {
            Resource resource = new FileSystemResource(indexPath.toFile());
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(resource);
        }
        return ResponseEntity.notFound().build();
    }
}
