# Vision Monitor VMS - Backend

Spring Boot 3.x + Java 21로 구성된 REST API 서버

## 사전 요구사항

- Java 21
- MariaDB 10.6+
- Maven 3.8+

## 설치

```bash
cd backend
mvn clean install
```

## 개발 서버 실행

```bash
mvn spring-boot:run
```

서버는 `http://localhost:8080`에서 실행됩니다.

## 데이터베이스 설정

### MariaDB 초기화

```bash
# 데이터베이스 및 사용자 생성
mysql -u root -p < scripts/database-init.sql

# 또는 수동 설정
mysql -u root -p
CREATE DATABASE vision_monitor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vision'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON vision_monitor.* TO 'vision'@'localhost';
FLUSH PRIVILEGES;
```

### 마이그레이션

Flyway가 자동으로 마이그레이션을 실행합니다:
- `V001__init.sql` - 초기 스키마 (7개 테이블)
- `V002__add_user_layouts.sql` - Layout 테이블 추가

## 프로젝트 구조

```
src/main/java/com/vision/
├── VisionMonitorApplication.java  # 메인 클래스
├── entity/                        # JPA Entities
│   ├── Camera.java
│   ├── Stream.java
│   ├── Event.java
│   ├── Recording.java
│   ├── AlertSetting.java
│   └── Layout.java               # 개인화 그리드 레이아웃
├── repository/                    # Spring Data JPA Repositories
│   ├── CameraRepository.java
│   ├── StreamRepository.java
│   ├── EventRepository.java
│   ├── RecordingRepository.java
│   ├── AlertSettingRepository.java
│   └── LayoutRepository.java
├── controller/                    # REST Controllers
│   ├── CameraController.java
│   ├── StreamController.java
│   ├── EventController.java
│   ├── RecordingController.java
│   ├── AlertSettingController.java
│   └── LayoutController.java
├── service/                       # Business Logic
│   ├── CameraService.java
│   ├── EventService.java
│   ├── RecordingService.java
│   └── LayoutService.java
├── dto/                           # Data Transfer Objects
│   ├── CameraDto.java
│   └── LayoutDto.java
├── config/                        # Configuration
│   ├── DatabaseConfig.java
│   ├── WebConfig.java
│   └── SecurityConfig.java (선택사항)
├── exception/                     # Exception Handling
│   ├── ApiException.java
│   └── GlobalExceptionHandler.java
└── util/                          # Utility Classes
    └── ApiResponse.java

src/main/resources/
├── application.yml               # Spring Boot 설정
├── db/migration/
│   ├── V001__init.sql            # 초기 스키마
│   └── V002__add_user_layouts.sql # Layout 테이블
└── logback-spring.xml            # 로깅 설정
```

## API 문서

### Swagger/OpenAPI UI

서버 실행 후 다음 주소에서 API 문서를 확인할 수 있습니다:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 주요 기술 스택

- **Spring Boot 3.2** - 웹 프레임워크
- **Spring Data JPA** - ORM
- **MariaDB** - 관계형 데이터베이스
- **Flyway** - 데이터베이스 마이그레이션
- **Lombok** - 보일러플레이트 코드 제거
- **SpringDoc OpenAPI** - Swagger/OpenAPI 문서 자동 생성
- **JUnit 5** - 단위 테스트
- **Mockito** - Mock 객체 라이브러리

## 테스트

### 단위 테스트 실행

```bash
mvn test
```

### 특정 테스트 클래스만 실행

```bash
mvn test -Dtest=CameraRepositoryTest
```

## 빌드 및 배포

### 프로덕션 빌드

```bash
mvn clean package
```

JAR 파일이 `target/` 디렉토리에 생성됩니다.

### 실행

```bash
java -jar target/vision-monitor-0.0.1-SNAPSHOT.jar
```

## 개발 가이드

### 새로운 Entity 추가

1. `entity/` 디렉토리에 Entity 클래스 생성
2. `repository/` 디렉토리에 Repository 인터페이스 생성
3. 마이그레이션 파일 추가 (`src/main/resources/db/migration/`)

### 새로운 API Endpoint 추가

1. `dto/` 디렉토리에 DTO 클래스 생성 (필요시)
2. `service/` 디렉토리에 Service 클래스 생성
3. `controller/` 디렉토리에 Controller 클래스 생성

예:
```java
@RestController
@RequestMapping("/api/cameras")
public class CameraController {
    
    @Autowired
    private CameraService cameraService;
    
    @GetMapping
    public ApiResponse<List<CameraDto>> getAllCameras() {
        return ApiResponse.success(cameraService.getAllCameras());
    }
}
```

### 에러 처리

모든 API 응답은 표준 `ApiResponse` 형식을 사용합니다:

```json
{
    "success": true,
    "data": {...},
    "message": "Success",
    "timestamp": "2024-01-01T12:00:00"
}
```

에러 응답:

```json
{
    "success": false,
    "error": "CAMERA_NOT_FOUND",
    "message": "Camera with id 1 not found",
    "timestamp": "2024-01-01T12:00:00"
}
```

## 환경 변수

### MariaDB 연결 설정

`application.yml` 또는 환경 변수에서 설정:

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/vision_monitor
    username: root
    password: password
```

## 트러블슈팅

### MariaDB 연결 실패

```bash
# MariaDB 서버 상태 확인 (Linux/Mac)
systemctl status mariadb

# MariaDB 시작 (Linux)
sudo systemctl start mariadb

# MariaDB 시작 (Mac - Homebrew)
brew services start mariadb
```

### 포트 8080 이미 사용 중

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### 데이터베이스 마이그레이션 오류

```bash
# Flyway 히스토리 초기화 (개발 환경만)
mvn flyway:clean
mvn flyway:migrate
```

## Phase 3 구현 예정

- [ ] 카메라 관리 API
- [ ] 실시간 이벤트 처리
- [ ] 녹화 데이터 관리
- [ ] 사용자 인증 및 권한 관리
- [ ] 개인화 그리드 레이아웃 API
- [ ] WebSocket 기반 실시간 스트리밍
- [ ] 알림 시스템 (이메일, SMS, 인앱)

## 자세한 내용

- [Spring Boot 문서](https://spring.io/projects/spring-boot)
- [Spring Data JPA 문서](https://spring.io/projects/spring-data-jpa)
- [Flyway 문서](https://flywaydb.org/)
- [Swagger/OpenAPI](https://swagger.io/)
