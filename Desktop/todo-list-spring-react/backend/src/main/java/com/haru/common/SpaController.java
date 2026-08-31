package com.haru.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class SpaController {

    @Value("${app.frontend.path:./dist/public}")
    private String frontendPath;

    /**
     * Serve index.html for all non-API, non-static-file routes.
     * This enables React Router to handle client-side routing.
     */
    @GetMapping(value = {"/", "/{path:[^\\.]*}"})
    public ResponseEntity<Resource> serveIndex(HttpServletRequest request) throws IOException {
        String uri = request.getRequestURI();

        // Skip API routes — handled by TodoController etc.
        if (uri.startsWith("/api")) {
            return ResponseEntity.notFound().build();
        }

        Path indexPath = Path.of(frontendPath, "index.html");
        if (Files.exists(indexPath)) {
            Resource resource = new FileSystemResource(indexPath.toFile());
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(resource);
        }
        return ResponseEntity.notFound().build();
    }
}
