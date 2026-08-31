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

    /**
     * 모든 non-api 경로에 대해:
     * 1. 파일이 실제로 존재하면 해당 파일을 리턴 (JS, CSS, 이미지 등)
     * 2. 없으면 index.html을 리턴 (SPA fallback — 클라이언트 사이드 라우팅)
     */
    @GetMapping(value = "/{path:^(?!api|assets).*}", "/{path:^(?!api|assets).*}/**")
    public ResponseEntity<Resource> serveStaticOrFallback() throws IOException {
        // 요청된 경로에서 파일을 찾기 위해 Path 추출
        // Spring MVC가 실제 파일이 있으면 리소스 핸들러에서 먼저 처리하고,
        // 여기까지 오면SPA fallback으로 index.html 반환
        return serveFile("index.html", MediaType.TEXT_HTML);
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
