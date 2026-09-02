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

    /**
     * SPA 클라이언트 라우트 지원: /login, /register, /app 등
     * API 경로와 정적 파일을 제외한 모든 경로에서 index.html을 반환합니다.
     */
    @GetMapping({"/", "/login", "/register", "/app", "/app/**"})
    public ResponseEntity<Resource> serveIndex() throws IOException {
        return serveFile("index.html");
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Resource> serveFavicon() throws IOException {
        return serveFile("favicon.ico");
    }

    @GetMapping("/manifest.webmanifest")
    public ResponseEntity<Resource> serveManifest() throws IOException {
        return serveFile("manifest.webmanifest");
    }

    @GetMapping("/sw.js")
    public ResponseEntity<Resource> serveServiceWorker() throws IOException {
        Path filePath = Path.of(frontendPath, "sw.js");
        if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
            Resource resource = new FileSystemResource(filePath.toFile());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/javascript"))
                    .header("Service-Worker-Allowed", "/")
                    .body(resource);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/workbox-*.js")
    public ResponseEntity<Resource> serveWorkbox(jakarta.servlet.http.HttpServletRequest request) throws IOException {
        String uri = request.getRequestURI().substring(1); // remove leading /
        return serveFile(uri);
    }

    private ResponseEntity<Resource> serveFile(String fileName) throws IOException {
        Path filePath = Path.of(frontendPath, fileName);
        if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
            Resource resource = new FileSystemResource(filePath.toFile());
            MediaType mediaType = getContentType(fileName);
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);
        }
        return ResponseEntity.notFound().build();
    }

    private MediaType getContentType(String fileName) {
        if (fileName.endsWith(".html")) return MediaType.TEXT_HTML;
        if (fileName.endsWith(".css"))  return MediaType.parseMediaType("text/css");
        if (fileName.endsWith(".js"))   return MediaType.parseMediaType("application/javascript");
        if (fileName.endsWith(".json")) return MediaType.APPLICATION_JSON;
        if (fileName.endsWith(".webmanifest")) return MediaType.parseMediaType("application/manifest+json");
        if (fileName.endsWith(".png"))  return MediaType.IMAGE_PNG;
        if (fileName.endsWith(".jpg"))  return MediaType.IMAGE_JPEG;
        if (fileName.endsWith(".svg"))  return MediaType.parseMediaType("image/svg+xml");
        if (fileName.endsWith(".ico"))  return MediaType.parseMediaType("image/x-icon");
        if (fileName.endsWith(".woff")) return MediaType.parseMediaType("font/woff");
        if (fileName.endsWith(".woff2"))return MediaType.parseMediaType("font/woff2");
        if (fileName.endsWith(".ttf"))  return MediaType.parseMediaType("font/ttf");
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
