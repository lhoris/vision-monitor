# Vision Monitor VMS - Backend

Spring Boot 3.x + Java 21濡?援ъ꽦??REST API ?쒕쾭

## ?ъ쟾 ?붽뎄?ы빆

- Java 21
- MariaDB 10.6+
- Maven 3.8+

## ?ㅼ튂

```bash
cd backend
mvn clean install
```

## 媛쒕컻 ?쒕쾭 ?ㅽ뻾

```bash
mvn clean spring-boot:run "-Dspring-boot.run.profiles=local"
```

?쒕쾭??`http://localhost:8080`?먯꽌 ?ㅽ뻾?⑸땲??

## ?곗씠?곕쿋?댁뒪 ?ㅼ젙

### MariaDB 珥덇린??
```bash
# ?곗씠?곕쿋?댁뒪 諛??ъ슜???앹꽦
mysql -u root -p < scripts/database-init.sql

# ?먮뒗 ?섎룞 ?ㅼ젙
mysql -u root -p
CREATE DATABASE vision_monitor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vision'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON vision_monitor.* TO 'vision'@'localhost';
FLUSH PRIVILEGES;
```

### 留덉씠洹몃젅?댁뀡

Flyway媛 ?먮룞?쇰줈 留덉씠洹몃젅?댁뀡???ㅽ뻾?⑸땲??
- `V001__init.sql` - baseline marker
- `V002__create_m26_user_master_tables.sql` - ?ъ슜??沅뚰븳/怨듯넻肄붾뱶/媛쒖씤???뚯씠釉?- `V003__seed_m26_master_data.sql` - 媛쒕컻???ъ슜??沅뚰븳 seed
- `V005__allow_null_foundation_password.sql` - password reset support
湲곗〈 濡쒖뺄 DB???덉쟾 `V001`???대? ?곸슜?섏뼱 ?덉쑝硫?Flyway checksum???щ씪吏묐땲??
媛쒕컻 ?섍꼍?먯꽌??`scripts/database-init.sql`濡?`PPWIRE` DB瑜??ъ깮?깊븳 ???쒖옉?섏꽭??

## ?꾨줈?앺듃 援ъ“

```
src/main/java/com/vision/
?쒋?? VisionMonitorApplication.java  # 硫붿씤 ?대옒???쒋?? entity/                        # JPA Entities
??  ?쒋?? UserAccount.java
??  ?쒋?? Authorization.java
??  ?쒋?? UserAuthorization.java
??  ?쒋?? UserPersonal.java
??  ?붴?? Layout.java               # 媛쒖씤??洹몃━???덉씠?꾩썐
?쒋?? repository/                    # Spring Data JPA Repositories
??  ?쒋?? UserAccountRepository.java
??  ?쒋?? AuthorizationRepository.java
??  ?쒋?? UserAuthorizationRepository.java
??  ?쒋?? UserPersonalRepository.java
??  ?붴?? LayoutRepository.java
?쒋?? controller/                    # REST Controllers
??  ?쒋?? CameraController.java
??  ?쒋?? StreamController.java
??  ?쒋?? EventController.java
??  ?쒋?? RecordingController.java
??  ?쒋?? AlertSettingController.java
??  ?붴?? LayoutController.java
?쒋?? service/                       # Business Logic
??  ?쒋?? AuthService.java
??  ?쒋?? UserManagementService.java
??  ?붴?? LayoutService.java
?쒋?? dto/                           # Data Transfer Objects
??  ?쒋?? CameraDto.java
??  ?붴?? LayoutDto.java
?쒋?? config/                        # Configuration
??  ?쒋?? DatabaseConfig.java
??  ?쒋?? WebConfig.java
??  ?붴?? SecurityConfig.java (?좏깮?ы빆)
?쒋?? exception/                     # Exception Handling
??  ?쒋?? ApiException.java
??  ?붴?? GlobalExceptionHandler.java
?붴?? util/                          # Utility Classes
    ?붴?? ApiResponse.java

src/main/resources/
?쒋?? application.yml               # Spring Boot ?ㅼ젙
?쒋?? db/migration/
??  ?쒋?? V001__init.sql            # baseline marker
??  ?쒋?? V002__create_m26_user_master_tables.sql
??  ?쒋?? V003__seed_m26_master_data.sql
??  ?붴?? V005__allow_null_foundation_password.sql
?붴?? logback-spring.xml            # 濡쒓퉭 ?ㅼ젙
```

## API 臾몄꽌

### Swagger/OpenAPI UI

?쒕쾭 ?ㅽ뻾 ???ㅼ쓬 二쇱냼?먯꽌 API 臾몄꽌瑜??뺤씤?????덉뒿?덈떎:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 二쇱슂 湲곗닠 ?ㅽ깮

- **Spring Boot 3.2** - ???꾨젅?꾩썙??- **Spring Data JPA** - ORM
- **MariaDB** - 愿怨꾪삎 ?곗씠?곕쿋?댁뒪
- **Flyway** - ?곗씠?곕쿋?댁뒪 留덉씠洹몃젅?댁뀡
- **Lombok** - 蹂댁씪?ы뵆?덉씠??肄붾뱶 ?쒓굅
- **SpringDoc OpenAPI** - Swagger/OpenAPI 臾몄꽌 ?먮룞 ?앹꽦
- **JUnit 5** - ?⑥쐞 ?뚯뒪??- **Mockito** - Mock 媛앹껜 ?쇱씠釉뚮윭由?
## ?뚯뒪??
### ?⑥쐞 ?뚯뒪???ㅽ뻾

```bash
mvn test
```

### ?뱀젙 ?뚯뒪???대옒?ㅻ쭔 ?ㅽ뻾

```bash
mvn test -Dtest=CameraRepositoryTest
```

## 鍮뚮뱶 諛?諛고룷

### ?꾨줈?뺤뀡 鍮뚮뱶

```bash
mvn clean package
```

JAR ?뚯씪??`target/` ?붾젆?좊━???앹꽦?⑸땲??

### ?ㅽ뻾

```bash
java -jar target/vision-monitor-0.0.1-SNAPSHOT.jar
```

## 媛쒕컻 媛?대뱶

### ?덈줈??Entity 異붽?

1. `entity/` ?붾젆?좊━??Entity ?대옒???앹꽦
2. `repository/` ?붾젆?좊━??Repository ?명꽣?섏씠???앹꽦
3. 留덉씠洹몃젅?댁뀡 ?뚯씪 異붽? (`src/main/resources/db/migration/`)

### ?덈줈??API Endpoint 異붽?

1. `dto/` ?붾젆?좊━??DTO ?대옒???앹꽦 (?꾩슂??
2. ?ㅼ젣 backend 梨낆엫 踰붿쐞?쇰㈃ `service/` ?붾젆?좊━??Service ?대옒???앹꽦
3. `controller/` ?붾젆?좊━??Controller ?대옒???앹꽦
4. 移대찓???ㅽ듃由??대깽???뱁솕/?뚮┝? MVP?먯꽌 frontend mock-first 踰붿쐞?대?濡??ㅼ젣 ?뚯씠釉붽낵 JPA 怨꾩링??癒쇱? 留뚮뱾吏 ?딅뒗??

??
```java
@RestController
@RequestMapping("/api/cameras")
public class CameraController {

    @GetMapping
    public ApiResponse<List<CameraDto>> getAllCameras() {
        return ApiResponse.success(List.of());
    }
}
```

### ?먮윭 泥섎━

紐⑤뱺 API ?묐떟? ?쒖? `ApiResponse` ?뺤떇???ъ슜?⑸땲??

```json
{
    "success": true,
    "data": {...},
    "message": "Success",
    "timestamp": "2024-01-01T12:00:00"
}
```

?먮윭 ?묐떟:

```json
{
    "success": false,
    "error": "CAMERA_NOT_FOUND",
    "message": "Camera with id 1 not found",
    "timestamp": "2024-01-01T12:00:00"
}
```

## ?섍꼍 蹂??
### MariaDB ?곌껐 ?ㅼ젙

`application.yml` ?먮뒗 ?섍꼍 蹂?섏뿉???ㅼ젙:

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/vision_monitor
    username: root
    password: password
```

## ?몃윭釉붿뒋??
### MariaDB ?곌껐 ?ㅽ뙣

```bash
# MariaDB ?쒕쾭 ?곹깭 ?뺤씤 (Linux/Mac)
systemctl status mariadb

# MariaDB ?쒖옉 (Linux)
sudo systemctl start mariadb

# MariaDB ?쒖옉 (Mac - Homebrew)
brew services start mariadb
```

### ?ы듃 8080 ?대? ?ъ슜 以?
```bash
mvn spring-boot:run "-Dspring-boot.run.profiles=local" "-Dspring-boot.run.arguments=--server.port=8081"
```

### ?곗씠?곕쿋?댁뒪 留덉씠洹몃젅?댁뀡 ?ㅻ쪟

```bash
# Flyway ?덉뒪?좊━ 珥덇린??(媛쒕컻 ?섍꼍留?
mvn flyway:clean
mvn flyway:migrate
```

## Phase 3 援ы쁽 ?덉젙

- [ ] 移대찓??愿由?API
- [ ] ?ㅼ떆媛??대깽??泥섎━
- [ ] ?뱁솕 ?곗씠??愿由?- [ ] ?ъ슜???몄쬆 諛?沅뚰븳 愿由?- [ ] 媛쒖씤??洹몃━???덉씠?꾩썐 API
- [ ] WebSocket 湲곕컲 ?ㅼ떆媛??ㅽ듃由щ컢
- [ ] ?뚮┝ ?쒖뒪??(?대찓?? SMS, ?몄빋)

## ?먯꽭???댁슜

- [Spring Boot 臾몄꽌](https://spring.io/projects/spring-boot)
- [Spring Data JPA 臾몄꽌](https://spring.io/projects/spring-data-jpa)
- [Flyway 臾몄꽌](https://flywaydb.org/)
- [Swagger/OpenAPI](https://swagger.io/)
