package com.haru.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * SPA 라우팅 컨트롤러.
 * /api/** 를 제외한 모든 요청을 index.html로 전달하여
 * React Router(Wouter)가 클라이언트 라우팅을 처리하도록 합니다.
 *
 * 또한 PWA에 필요한 manifest.webmanifest, sw.js 등의 정적 파일을 서빙합니다.
 */
@Controller
public class SpaController implements ErrorController {

    @Value("${app.frontend.path:./dist/public}")
    private String frontendPath;

    /**
     * PWA manifest 서빙
     */
    @GetMapping("/manifest.webmanifest")
    @ResponseBody
    public ResponseEntity<Resource> serveManifest() throws IOException {
        return serveStaticFile("manifest.webmanifest", "application/manifest+json");
    }

    /**
     * PWA Service Worker 서빙 (Service-Worker-Allowed 헤더 필수)
     */
    @GetMapping("/sw.js")
    @ResponseBody
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

    /**
     * PWA Workbox 런타임 서빙
     */
    @GetMapping("/workbox-**")
    @ResponseBody
    public ResponseEntity<Resource> serveWorkbox(HttpServletRequest request) throws IOException {
        String uri = request.getRequestURI();
        if (uri.startsWith("/")) uri = uri.substring(1);
        return serveStaticFile(uri, "application/javascript");
    }

    /**
     * favicon 서빙
     */
    @GetMapping("/favicon.ico")
    @ResponseBody
    public ResponseEntity<Resource> serveFavicon() throws IOException {
        return serveStaticFile("favicon.ico", "image/x-icon");
    }

    /**
     * logo 서빙
     */
    @GetMapping("/logo.jpg")
    @ResponseBody
    public ResponseEntity<Resource> serveLogo() throws IOException {
        return serveStaticFile("logo.jpg", "image/jpeg");
    }

    /**
     * 핵심: /api/** 를 제외한 모든 GET 요청을 index.html로 전달.
     * Spring의 ErrorController를 구현하여 404도 index.html로 fallback합니다.
     */
    @GetMapping({"/", "/login", "/register", "/app", "/app/**"})
    @ResponseBody
    public ResponseEntity<Resource> serveApp() throws IOException {
        return serveStaticFile("index.html", "text/html");
    }

    /**
     * 404 에러도 index.html로 전달 (SPA fallback)
     */
    @GetMapping("/error")
    @ResponseBody
    public ResponseEntity<Resource> handleError(HttpServletRequest request) throws IOException {
        // API 요청이 아닌 경우에만 index.html로 fallback
        String originalUri = (String) request.getAttribute("jakarta.servlet.error.request_uri");
        if (originalUri != null && originalUri.startsWith("/api/")) {
            return ResponseEntity.notFound().build();
        }
        return serveStaticFile("index.html", "text/html");
    }

    private ResponseEntity<Resource> serveStaticFile(String fileName, String contentType) throws IOException {
        Path filePath = Path.of(frontendPath, fileName);
        if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
            Resource resource = new FileSystemResource(filePath.toFile());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        }
        return ResponseEntity.notFound().build();
    }
}
