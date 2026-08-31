# 오늘할일 TodoList

React 기반의 TodoList 프론트엔드 프로젝트입니다. Todo는 제목, 내용, 마감일, 완료 여부, 카테고리를 가지며 목록 조회·등록·수정·삭제·완료 처리와 페이지네이션을 제공합니다. 프론트엔드는 `VITE_API_BASE_URL`로 지정한 Spring Boot REST API만 사용하며, Todo 생성·수정·삭제·완료 처리는 모두 서버를 거쳐 실제 데이터베이스에 저장됩니다.

## 구현 범위

| 영역 | 구현 내용 |
|---|---|
| Todo CRUD | 등록, 조회, 수정, 삭제, 완료/미완료 토글 |
| 상태 표시 | 마감 24시간 이내 항목의 `임박` 배지, 완료 취소선, 요약 카운터 |
| 목록 조회 | 검색, 전체/진행 중/완료 필터, 페이지네이션 |
| 저장 | `VITE_API_BASE_URL` 기반 Spring Boot REST API 연동; 서버 DB 저장 |
| UI | 오늘할일의 종이 질감 편집 디자인, 반응형 레이아웃, 키보드 포커스, reduced-motion 대응 |
| 인증 | 심화 항목으로 확장 가능한 사용자 식별 필드와 JWT 적용 안내 |

## 실행

```bash
pnpm install
pnpm dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다. 브라우저에서 바로 Todo를 추가하고 수정·완료·삭제할 수 있습니다.

## Spring Boot 백엔드 모듈

실행 가능한 Spring Boot 3.5 + Java 17 호환 + JPA 모듈을 `backend/`에 추가했습니다. Maven으로 백엔드를 실행하면 H2 개발 DB에 Todo가 저장되고, `dev` 프로필은 애플리케이션 종료 시 데이터가 초기화됩니다. 운영에서는 `prod` 프로필과 MySQL 환경변수를 사용합니다.

```bash
cd backend
mvn spring-boot:run
# 운영 실행 예시
mvn clean package
java -jar target/haru-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

프론트엔드는 기본적으로 `http://localhost:8080`을 호출합니다. 다른 주소를 사용하려면 프론트엔드 빌드 시 `VITE_API_BASE_URL`을 설정합니다. Spring Boot의 CORS 허용 출처는 `CORS_ALLOWED_ORIGINS`로 설정할 수 있습니다.

## Spring Boot 백엔드 권장 구조

백엔드는 저장소 안의 `backend/` Spring Boot 애플리케이션으로 구성되어 있습니다. 패키지 구조는 다음과 같습니다.

```text
backend/
  src/main/java/com/haru/
    HaruApplication.java
    todo/Todo.java
    todo/TodoRepository.java
    todo/TodoService.java
    todo/TodoController.java
    common/WebConfig.java
  src/main/resources/application.yml
```

### 도메인 모델

`Todo` 엔티티는 `id`, `title`, `content`, `dueDate`, `completed`, `category`, `createdAt`, `updatedAt`를 가집니다. `dueDate`는 `LocalDateTime`, `completed`는 `boolean`, `category`는 nullable `String`으로 두면 H2와 MySQL에서 동일하게 동작합니다. 목록 API는 `Page<Todo>`를 반환하도록 `Pageable`을 사용하고 `dueDate` 오름차순으로 정렬합니다.

### REST API 계약

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/todos?page=0&size=10&status=OPEN&query=` | 페이지 단위 목록 조회 |
| POST | `/api/todos` | Todo 등록 |
| GET | `/api/todos/{id}` | 단건 조회 |
| PUT | `/api/todos/{id}` | Todo 수정 |
| PATCH | `/api/todos/{id}/complete` | 완료 상태 변경 |
| DELETE | `/api/todos/{id}` | Todo 삭제 |

프론트엔드는 `client/src/lib/todos-api.ts`의 `fetch` 클라이언트를 통해 백엔드를 호출합니다. 개발 시 기본 주소는 `http://localhost:8080`이며, 배포 빌드에서는 `VITE_API_BASE_URL`을 Spring Boot 백엔드의 공개 주소로 설정해야 합니다. API 응답은 다음 형태를 권장합니다.

```json
{
  "content": [
    {
      "id": 1,
      "title": "분기별 제품 로드맵 정리",
      "content": "우선순위와 의존성을 정리합니다.",
      "dueDate": "2026-08-28T17:30:00",
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

## H2 / MySQL 설정 예시

`backend/src/main/resources/application.yml`에 개발용 H2와 운영용 MySQL 프로필을 모두 구성했습니다. 운영 환경에서는 다음 환경변수를 설정합니다.

```bash
SPRING_PROFILES_ACTIVE=prod
DB_HOST=your-rds-endpoint
DB_PORT=3306
DB_NAME=todolist
DB_USERNAME=app_user
DB_PASSWORD=change-me
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.example
```



개발 환경은 H2 메모리 데이터베이스를 사용합니다.

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:todolist
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
  h2:
    console:
      enabled: true
```

MySQL 운영 환경에서는 환경변수를 사용합니다.

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:3306/${DB_NAME:todolist}?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
```

운영 데이터베이스에서는 `ddl-auto: validate`를 유지하고 스키마 변경은 Flyway 또는 Liquibase로 관리하는 것을 권장합니다.

## AWS EC2 배포 절차

이 저장소에는 프론트엔드 작업공간과 백엔드 API 계약이 포함되어 있습니다. 실제 AWS 제출 URL을 만들려면 사용자의 AWS 계정에서 EC2 인스턴스, 보안 그룹, 도메인 또는 퍼블릭 IPv4를 준비해야 합니다. 이 작업공간에서 AWS 계정에 대신 접속하거나 배포 버튼을 실행하지는 않습니다.

1. Ubuntu EC2에 Java 17, Node.js, MySQL을 설치하거나 RDS MySQL을 연결합니다.
2. Spring Boot를 `./gradlew bootJar`로 빌드하고 `java -jar app.jar --spring.profiles.active=prod`로 실행합니다.
3. React를 `pnpm build`로 빌드하고 Nginx로 정적 파일을 제공합니다.
4. `/api/` 요청은 Spring Boot 포트로 reverse proxy하고, 나머지는 React의 `index.html`로 fallback합니다.
5. 보안 그룹에서 HTTP 80과 HTTPS 443만 공개하고, 8080·3306은 외부에 직접 공개하지 않습니다.
6. Certbot으로 TLS 인증서를 설정한 뒤, 실제 접속 주소를 제출 URL로 사용합니다.

> 현재 프로젝트의 관리형 미리보기 URL은 개발 확인용입니다. AWS 제출 URL은 EC2 배포 후 생성되는 주소로 교체해야 합니다.

## 인증 확장안

선택 심화 인증은 Spring Security와 JWT를 사용해 구현할 수 있습니다. `User`와 `Todo`를 `ManyToOne`으로 연결하고, 컨트롤러는 인증된 사용자 ID를 서비스 계층에 전달해 `findAllByUserId`와 `findByIdAndUserId`만 사용해야 합니다. 프론트엔드는 로그인 성공 후 access token을 메모리 또는 안전한 쿠키에 보관하고 API 요청에 `Authorization: Bearer ...`를 붙입니다.

## 검증 체크리스트

- [x] Todo 등록·조회·수정·삭제
- [x] 완료 상태 토글
- [x] 24시간 이내 마감 임박 표시
- [x] 검색 및 상태 필터
- [x] 페이지네이션
- [x] 반응형 UI
- [x] README 및 AWS 배포 절차
- [x] Spring Boot API 연결 클라이언트 구현
- [ ] AWS EC2 실제 배포 URL
- [ ] 사용자 로그인 및 사용자별 Todo 분리
