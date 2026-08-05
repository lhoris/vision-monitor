# Vision Monitor VMS

제조 공정 CCTV 모니터링 시스템 (Manufacturing AI Monitoring Dashboard)
- POSCO 포항 제철소 4선재 공정 모니터링

## 🎯 프로젝트 개요

Vision Monitor VMS는 다중 카메라 실시간 모니터링, 개인화된 그리드 레이아웃, 이벤트 감지, 영상 재생 등의 기능을 제공하는 웹 기반 VMS입니다.

### Phase 구조

- **Phase 1**: 요구사항 분석 및 설계 ✅
- **Phase 2**: Harness Engineering (현재 단계) - 기초 인프라 구축 ✅
- **Phase 3**: 11개 Agent를 통한 병렬 구현 (예정)

## 📋 사전 요구사항

### 필수 소프트웨어

- **Java 21**
- **Node.js 18+** (npm 9+ 또는 yarn 4+)
- **MariaDB 10.6+**
- **Maven 3.8+**
- **Git**

### 시스템 요구사항

- RAM: 최소 8GB
- 저장소: 최소 10GB
- OS: Linux, macOS 또는 Windows (WSL2 권장)

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repo-url>
cd vision-monitor
```

### 2. 데이터베이스 설정

```bash
# MariaDB 데이터베이스 및 사용자 생성
mysql -u root -p < scripts/database-init.sql
```

마이그레이션은 Spring Boot 시작 시 Flyway가 자동으로 실행합니다.

### 3. 환경 설정

#### Frontend

```bash
cd frontend
cp .env.example .env.local
# 필요시 .env.local 수정
```

#### Backend

`backend/src/main/resources/application.yml`에서 MariaDB 연결 정보 확인:

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/vision_monitor
    username: root
    password: password
```

### 4. 개발 서버 실행

#### 방법 1: 자동 스크립트 (권장)

```bash
# Linux/Mac
chmod +x scripts/develop.sh
./scripts/develop.sh
```

#### 방법 2: 수동 실행

터미널 1 - Backend:
```bash
cd backend
mvn spring-boot:run
```

터미널 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 5. 접속

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## 📁 프로젝트 구조

```
vision-monitor/
├── frontend/                 # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   ├── pages/           # 페이지
│   │   ├── services/        # API 서비스
│   │   ├── store/           # Redux 스토어
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── types/           # TypeScript 타입
│   │   └── styles/          # 스타일
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── backend/                  # Spring Boot 3.x + Java 21
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/vision/
│   │   │   │   ├── entity/         # JPA Entities
│   │   │   │   ├── repository/     # Repositories
│   │   │   │   ├── controller/     # REST Controllers
│   │   │   │   ├── service/        # Business Logic
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── config/         # Configuration
│   │   │   │   ├── exception/      # Exception Handling
│   │   │   │   └── util/           # Utilities
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/   # Flyway 마이그레이션
│   │   └── test/
│   ├── pom.xml
│   └── README.md
│
├── scripts/                  # 배포 및 설정 스크립트
│   ├── deploy.sh           # 프로덕션 배포
│   ├── develop.sh          # 개발 환경 시작
│   └── database-init.sql   # 데이터베이스 초기화
│
├── docs/                    # 설계 문서
│   ├── architecture.md
│   ├── api-spec.md
│   └── database-schema.md
│
└── README.md
```

## 🛠️ 주요 기술 스택

### Frontend

- **React 19** - UI 라이브러리
- **Vite** - 빌드 도구 (고속 개발)
- **TypeScript** - 타입 안전성
- **Redux Toolkit** - 상태 관리
- **Axios** - HTTP 클라이언트
- **Tailwind CSS** - 유틸리티 CSS
- **Vitest** - 단위 테스트

### Backend

- **Spring Boot 3.2** - 웹 프레임워크
- **Spring Data JPA** - ORM
- **MariaDB** - 관계형 데이터베이스
- **Flyway** - 데이터베이스 마이그레이션
- **Lombok** - 보일러플레이트 제거
- **SpringDoc OpenAPI** - Swagger/OpenAPI
- **JUnit 5 & Mockito** - 테스트

## 📚 개발 가이드

### Frontend 개발

더 자세한 내용은 [frontend/README.md](frontend/README.md)를 참고하세요.

```bash
cd frontend
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run test         # 테스트
```

### Backend 개발

더 자세한 내용은 [backend/README.md](backend/README.md)를 참고하세요.

```bash
cd backend
mvn spring-boot:run  # 개발 서버
mvn clean package    # 프로덕션 빌드
mvn test             # 테스트
```

## 🗄️ 데이터베이스 스키마

### 테이블 구조

1. **cameras** - 카메라 정보
2. **streams** - 스트림 정보
3. **events** - 이벤트 로그
4. **recordings** - 녹화 정보
5. **alert_settings** - 알림 설정
6. **users** - 사용자 정보
7. **audit_logs** - 감사 로그
8. **layouts** - 개인화 그리드 레이아웃

상세 내용은 [docs/database-schema.md](docs/database-schema.md)를 참고하세요.

## 🚢 배포

### 프로덕션 빌드 및 배포

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Docker 배포 (예정)

```bash
docker build -t vision-monitor .
docker run -p 8080:8080 vision-monitor
```

## 📝 API 문서

### Swagger UI

Spring Boot 시작 후 [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)에서 API 문서를 확인할 수 있습니다.

### 주요 API Endpoints

```
# 카메라
GET    /api/cameras          # 모든 카메라 조회
GET    /api/cameras/{id}     # 카메라 상세 조회
POST   /api/cameras          # 카메라 등록
PUT    /api/cameras/{id}     # 카메라 업데이트
DELETE /api/cameras/{id}     # 카메라 삭제

# 개인화 레이아웃
GET    /api/layouts/{userId}  # 사용자 레이아웃 조회
POST   /api/layouts           # 레이아웃 저장
PUT    /api/layouts/{id}      # 레이아웃 업데이트
DELETE /api/layouts/{id}      # 레이아웃 삭제

# 이벤트
GET    /api/events           # 이벤트 조회
POST   /api/events           # 이벤트 생성
```

## 🔄 CI/CD

현재는 수동 배포입니다. Phase 3에서 GitHub Actions/GitLab CI 통합 예정입니다.

## 🐛 트러블슈팅

### MariaDB 연결 실패

```bash
# MariaDB 상태 확인
systemctl status mariadb

# MariaDB 시작 (Linux)
sudo systemctl start mariadb

# MariaDB 시작 (Mac - Homebrew)
brew services start mariadb
```

### 포트 충돌

```bash
# 포트 3000 이미 사용 중인 경우
cd frontend
npm run dev -- --port 3001

# 포트 8080 이미 사용 중인 경우
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### 마이그레이션 오류

```bash
# Flyway 히스토리 초기화 (개발 환경만)
cd backend
mvn flyway:clean
mvn flyway:migrate
```

## 📖 문서

- [Architecture Guide](docs/architecture.md)
- [API Specification](docs/api-spec.md)
- [Database Schema](docs/database-schema.md)
- [Frontend Development Guide](frontend/README.md)
- [Backend Development Guide](backend/README.md)

## 📋 Phase 3 구현 계획

11개 Agent Team으로 다음 기능들을 병렬로 구현합니다:

### Frontend (5개 Agent)

1. **Live Streaming Component** - 카메라 실시간 스트림 재생
2. **Personalized Grid Layout** - 개인화된 카메라 그리드 (드래그앤드롭)
3. **Events Dashboard** - 실시간 이벤트 모니터링
4. **Playback System** - 영상 재생 및 검색
5. **Settings & User Management** - 사용자 설정 관리

### Backend (5개 Agent)

6. **Camera Management Service** - 카메라 CRUD 및 상태 관리
7. **Stream Processing** - 실시간 스트림 처리 (WebSocket)
8. **Event Detection & Logging** - AI 이벤트 감지 및 로깅
9. **Recording Management** - 영상 녹화 및 저장소 관리
10. **Alert & Notification System** - 알림 시스템 (Email, SMS, In-app)

### Infrastructure (1개 Agent)

11. **DevOps & Deployment** - CI/CD 파이프라인, Docker, Kubernetes

## 🤝 기여

이 프로젝트는 POSCO 포항 제철소의 제조 공정 모니터링을 위해 개발되었습니다.

## 📄 라이선스

내부 사용만 허가됩니다.

## 👥 팀

- **PM/Architect**: AI Integration & System Design
- **11 Agent Teams**: Phase 3 Parallel Development

## 📞 지원

문제가 발생하면 프로젝트 담당자에게 문의하세요.

---

**상태**: Phase 2 - Harness Engineering ✅ 완료
**다음**: Phase 3 - Agent Teams을 통한 병렬 구현
