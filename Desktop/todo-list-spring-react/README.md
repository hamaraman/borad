# 오늘할일 ✏️

> 종이 질감의 편안한 공간에서, 해야 할 일을 **한 줄씩 선명하게** 정리합니다.

Spring Boot + React 기반의 풀스택 Todo 앱입니다.  
PWA를 지원하여 데스크톱·모바일에 앱으로 설치할 수 있으며, 로그인/회원가입/테스트 계정 기능을 제공합니다.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Supported-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 주요 기능

| 기능 | 설명 |
|------|------|
| **Todo CRUD** | 등록, 조회, 수정, 삭제, 완료/미완료 토글 |
| **로그인 / 회원가입** | 인증 기반 접근 제어 (백엔드 오프라인 시 자동 테스트 모드 전환) |
| **테스트 계정** | 가입 없이 원클릭으로 모든 기능 체험 가능 |
| **PWA** | 홈 화면 설치, 오프라인 캐싱, 서비스 워커 자동 업데이트 |
| **드래그 앤 드롭** | dnd-kit 기반 Todo 순서 변경 |
| **검색 & 필터** | 키워드 검색, 전체/진행 중/완료 필터, 페이지네이션 |
| **임박 알림** | 마감 24시간 이내 항목에 `임박` 배지 자동 표시 |
| **뷰 모드** | 리스트 뷰 / 카드 뷰 전환 |
| **랜딩 페이지** | 앱 소개 + 회원가입/테스트 계정 진입점 |
| **Mock API** | 백엔드 서버 오프라인 시 LocalStorage 자동 대체 |
| **반응형 UI** | 종이 질감 편집 디자인, 모바일/데스크톱 대응 |

---

## 🏗️ 기술 스택

### Frontend
- **React 19** + **TypeScript 5.6**
- **Vite 7** (빌드 도구)
- **Tailwind CSS 4** (스타일링)
- **Radix UI** (접근성 컴포넌트)
- **Wouter** (클라이언트 라우팅)
- **dnd-kit** (드래그 앤 드롭)
- **vite-plugin-pwa** (PWA 지원)
- **Sonner** (토스트 알림)

### Backend
- **Spring Boot 3.5** + **Java 17**
- **Spring Data JPA**
- **H2** (개발 환경)
- **PostgreSQL / MySQL** (운영 환경)

---

## 🚀 빠른 시작

### 프론트엔드

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3000)
pnpm dev

# 프로덕션 빌드
pnpm build
```

### 백엔드

```bash
cd backend

# 개발 실행 (H2 인메모리 DB)
mvn spring-boot:run

# 프로덕션 빌드 & 실행
mvn clean package -DskipTests
java -jar target/haru-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

> **💡 백엔드 없이도 사용 가능합니다!**  
> 백엔드 서버가 꺼져 있으면 프론트엔드가 자동으로 LocalStorage 기반 Mock API로 전환되어 모든 기능이 정상 동작합니다.

---

## 📁 프로젝트 구조

```
todo-list-spring-react/
├── client/                     # React 프론트엔드
│   ├── public/
│   │   └── logo.jpg            # 앱 로고 (PWA 아이콘)
│   ├── src/
│   │   ├── components/         # UI 컴포넌트
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx  # 인증 상태 관리
│   │   │   └── ThemeContext.tsx # 테마 상태 관리
│   │   ├── lib/
│   │   │   └── todos-api.ts    # API 클라이언트 (Mock 폴백 포함)
│   │   ├── pages/
│   │   │   ├── Landing.tsx     # 랜딩 페이지
│   │   │   ├── Login.tsx       # 로그인
│   │   │   ├── Register.tsx    # 회원가입
│   │   │   └── Home.tsx        # 메인 Todo 화면
│   │   ├── App.tsx             # 라우팅 & 앱 셸
│   │   └── main.tsx            # 엔트리포인트 (PWA 등록)
│   └── index.html              # PWA 메타 태그 포함
├── backend/                    # Spring Boot 백엔드
│   ├── src/main/java/com/haru/
│   │   ├── todo/               # Todo 도메인 (Entity, Controller, Service, Repository)
│   │   └── common/             # SPA 라우팅, CORS 설정
│   └── src/main/resources/
│       └── application.yml     # DB 프로필 설정 (dev: H2 / prod: PostgreSQL)
├── server/                     # Express 정적 파일 서버 (선택)
├── vite.config.ts              # Vite + PWA 설정
├── Dockerfile                  # 멀티 스테이지 Docker 빌드
└── package.json
```

---

## 🔑 인증 흐름

```
Landing (/) ──┬── [시작하기] ──→ Register (/register)
              ├── [로그인] ──→ Login (/login)
              └── [테스트 계정] ──→ App (/app) 즉시 진입

Login ──┬── 아이디/비밀번호 입력 ──→ POST /api/auth/login ──→ App
        └── [테스트 계정으로 체험하기] ──→ App 즉시 진입

App (/app) ──→ 로그인 필수 (미인증 시 /login 리다이렉트)
           └── [로그아웃] ──→ Landing (/)
```

> **테스트 계정**: 랜딩 페이지 또는 로그인 페이지에서 버튼 하나로 즉시 로그인 가능

---

## 📡 REST API

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/todos?page=0&size=10&status=OPEN&query=` | 목록 조회 (페이지네이션) |
| `POST` | `/api/todos` | Todo 등록 |
| `PUT` | `/api/todos/{id}` | Todo 수정 |
| `PATCH` | `/api/todos/{id}/complete` | 완료 상태 변경 |
| `DELETE` | `/api/todos/{id}` | Todo 삭제 |

### 응답 예시

```json
{
  "content": [
    {
      "id": 1,
      "title": "분기별 제품 로드맵 정리",
      "content": "우선순위와 의존성을 정리합니다.",
      "dueDate": "2026-09-02T17:30:00",
      "completed": false,
      "category": "업무"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

---

## 📱 PWA (Progressive Web App)

- **설치**: 브라우저 주소창의 설치 버튼 또는 모바일의 "홈 화면에 추가"
- **오프라인 지원**: Service Worker가 정적 자산을 캐싱
- **자동 업데이트**: 새 버전 배포 시 서비스 워커 자동 갱신
- **Standalone 모드**: 설치 후 브라우저 UI 없이 앱처럼 실행

---

## 🐳 Docker 배포

```bash
docker build -t todo-app .
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname \
  -e SPRING_DATASOURCE_USERNAME=user \
  -e SPRING_DATASOURCE_PASSWORD=pass \
  todo-app
```

---

## ⚙️ 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_BASE_URL` | `""` (same-origin) | 프론트엔드 API 호출 주소 |
| `SPRING_PROFILES_ACTIVE` | `dev` | Spring 프로필 (`dev` / `prod`) |
| `SPRING_DATASOURCE_URL` | H2 메모리 | DB 접속 URL |
| `SPRING_DATASOURCE_USERNAME` | `sa` | DB 사용자 |
| `SPRING_DATASOURCE_PASSWORD` | - | DB 비밀번호 |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | CORS 허용 출처 |
| `PORT` / `BACKEND_PORT` | `8080` | 서버 포트 |

---

## ✅ 구현 체크리스트

- [x] Todo 등록·조회·수정·삭제
- [x] 완료 상태 토글
- [x] 24시간 이내 마감 임박 표시
- [x] 검색 및 상태 필터
- [x] 페이지네이션
- [x] 드래그 앤 드롭 순서 변경
- [x] 리스트 뷰 / 카드 뷰 전환
- [x] 반응형 UI (종이 질감 디자인)
- [x] 랜딩 페이지
- [x] 로그인 / 회원가입
- [x] 테스트 계정 (원클릭 체험)
- [x] PWA 지원 (설치, 오프라인, 서비스 워커)
- [x] Mock API 폴백 (백엔드 오프라인 대응)
- [x] Docker 멀티 스테이지 빌드
- [x] Spring Boot REST API 연동

---

## 📄 License

MIT
