# 운영 배포

## 배포 방식

운영 환경은 Linux VM, systemd, Nginx를 기준으로 합니다. 빌드는 개발/빌드 머신에서 수행하고, 운영 서버에서는 Maven이나 Node.js를 실행하지 않습니다.

```text
빌드 머신: bash scripts/build.sh
  -> backend/target/vision-monitor-*.jar
  -> frontend/dist/
  -> 두 산출물을 운영 서버 작업 디렉터리에 전달

Linux VM: sudo bash scripts/deploy.sh
  -> 산출물 검증 -> 설치 -> systemd 재기동 -> HTTP 준비 확인
```

`deploy.sh`는 `backend/target`에 실행 가능한 JAR가 정확히 하나 있고 `frontend/dist/index.html`이 있을 때만 진행합니다. 산출물이 없거나 여러 개면 운영 파일을 변경하지 않고 종료합니다.

## Linux VM 사전 준비

- 서비스 계정과 배포 경로를 준비합니다.
- systemd unit 기본 이름은 `visionmonitor-backend`입니다. 다르면 `BACKEND_SERVICE`로 지정합니다.
- unit은 `/opt/vision/vision-monitor.jar`를 실행하고 `WorkingDirectory=/opt/vision`으로 설정합니다.
- DB 접속정보 등 운영 환경 변수는 systemd `EnvironmentFile`로 주입합니다. 비밀번호를 스크립트나 저장소에 기록하지 않습니다.
- Nginx의 SPA document root는 `/var/www/vision`이어야 하고 `/api/`는 backend `127.0.0.1:8080`으로 프록시해야 합니다.
- 배포는 파일 설치와 systemd 제어 권한이 있는 계정으로 실행합니다.

예시 unit의 주요 항목:

```ini
[Service]
User=vision
WorkingDirectory=/opt/vision
EnvironmentFile=/etc/vision-monitor/vision-monitor.env
ExecStart=/usr/bin/java -jar /opt/vision/vision-monitor.jar
Restart=on-failure
RestartSec=5
```

unit은 인프라에 한 번 설치합니다. 스크립트는 unit이나 운영 DB 설정을 생성/변경하지 않습니다.

## 빌드 및 전달

빌드 머신에는 JDK 21, Node.js 24, npm과 `frontend/node_modules`가 준비되어 있어야 합니다. Maven 3.9.16은 프로젝트 Maven Wrapper가 필요할 때 내려받으므로 별도 설치나 `MAVEN_HOME` 설정이 필요하지 않습니다. Windows 스크립트는 설치 경로를 검색해 JDK 21을 선택하고 실행 프로세스에만 `JAVA_HOME`을 설정합니다. 전역 환경 변수는 변경하지 않습니다.

```bash
bash scripts/build.sh
```

Windows 빌드 머신:

```bat
scripts\build.bat
```

같은 커밋에서 만들어진 backend JAR와 `frontend/dist/` 전체를 운영 서버 작업 디렉터리에 전달합니다. 이전 JAR와 새 dist를 섞지 않습니다.

## Linux 배포

운영 서버에서 산출물이 놓인 저장소/작업 디렉터리를 기준으로 실행합니다.

```bash
sudo bash scripts/deploy.sh
```

기본 경로:

- JAR: `/opt/vision/vision-monitor.jar`
- frontend: `/var/www/vision`
- 로그 디렉터리: `/var/log/vision`
- systemd unit: `visionmonitor-backend`
- 준비 확인 URL: `http://127.0.0.1:8080/api/common-codes/bootstrap`

경로와 서비스 이름이 다르면 환경 변수로 지정합니다.

```bash
sudo env APP_DIR=/srv/vision WEB_DIR=/srv/www/vision LOG_DIR=/var/log/vision \
  BACKEND_SERVICE=visionmonitor-backend BACKEND_PORT=8080 bash scripts/deploy.sh
```

준비 확인은 인증 interceptor에서 예상되는 `401` 또는 `2xx` 응답을 성공으로 처리합니다. `5xx` 또는 제한 시간 내 무응답이면 실패 처리하고 이전 JAR/frontend 파일을 복구합니다. Flyway는 backend 시작 과정에서 실행되므로 DB 연결 및 migration 오류는 다음으로 확인합니다. 파일 복구는 DB migration을 되돌리지 않습니다. DB 변경이 포함된 배포는 하위 호환 가능한 migration인지 별도로 확인해야 합니다.

```bash
sudo journalctl -u visionmonitor-backend -n 100 --no-pager
sudo systemctl status visionmonitor-backend
```

정적 파일 변경은 Linux Nginx reload가 필요하지 않으므로 Linux 스크립트에서 Nginx를 재시작하지 않습니다.

## Windows 배포

`scripts/deploy.bat`은 이미 생성된 산출물만 배포합니다. 배포 전에 `scripts\build.bat`을 실행합니다. frontend 산출물과 정확히 하나의 backend JAR가 없으면 중단합니다. 포트 8080 점유 프로세스가 Vision Monitor JAR가 아니면 종료하지 않습니다. backend 준비 후 프로젝트 내부 Nginx 실행 파일·설정·정적 root 경로를 출력하고, `/`, 빌드된 JS/CSS asset, `/api/common-codes/bootstrap` 프록시 응답까지 확인합니다. `/api` 경로는 backend로 전달하고 나머지는 `deploy\www`의 정적 파일과 SPA 경로로 처리합니다. 정적 asset 파일이 없으면 HTML 대신 404를 반환합니다.

기본 배포 경로는 저장소 아래 `deploy\app`, `deploy\www`, `deploy\logs`입니다. 다른 루트는 `DEPLOY_DIR` 환경 변수로 지정할 수 있습니다. Windows Nginx 1.30.5 실행 파일과 공식 배포 파일은 저장소의 `nginx/windows/runtime`에 포함되어 있어 별도 다운로드가 필요 없습니다. `nginx/windows/nginx.conf.template`에서 실제 배포 경로에 맞는 설정을 생성합니다. 기본 포트는 `8088`이며 `NGINX_PORT`로 바꿀 수 있습니다. 공식 배포본의 라이선스 고지는 `nginx/windows/runtime/docs`에 포함되어 있습니다.

Windows용 Nginx는 내부 테스트/Windows 배포 편의 런타임입니다. 공식 문서는 Windows 빌드를 beta로 분류합니다. Linux 운영에서는 systemd와 배포판 Nginx를 사용하고, 저장소의 `nginx/linux/vision-monitor.conf`를 운영 Nginx 설정으로 적용합니다.

## 실패 시 점검

1. backend JAR와 frontend dist가 같은 커밋에서 빌드됐는지 확인합니다.
2. Linux는 unit의 이름/실행 경로/EnvironmentFile과 `systemctl status`를 확인합니다. Windows는 `deploy\logs\backend.log`를 확인합니다.
3. Flyway 오류가 있으면 DB 연결, 계정의 DDL 권한, migration 이력을 확인합니다. migration 이력이나 checksum을 수동으로 지우거나 수정하지 않습니다.
4. frontend는 열리지만 API가 실패하면 Nginx `/api` 프록시, backend 포트, 빌드 시 `VITE_API_URL` 설정을 확인합니다.
