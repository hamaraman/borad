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
        return serveFile("index.html", MediaType.TEXT_HTML);
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Resource> serveFavicon() throws IOException {
        return serveFile("favicon.ico", MediaType.parseMediaType("image/x-icon"));
    }

    private ResponseEntity<Resource> serveFile(String fileName, MediaType mediaType) throws IOException {
        Path filePath = Path.of(frontendPath, fileName);
        if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
            Resource resource = new FileSystemResource(filePath.toFile());
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);
        }
        return ResponseEntity.notFound().build();
    }
}
