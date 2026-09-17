package com.vision.service;

import com.vision.dto.RoleSummaryDto;
import com.vision.dto.UserAccountDto;
import com.vision.dto.UserDangerActionRequest;
import com.vision.dto.UserListResponse;
import com.vision.dto.UserMutationRequest;
import com.vision.entity.Code;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.CodeDetailRepository;
import com.vision.repository.CodeRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAuthorizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserManagementService {

    private static final String ACTIVE = "active";
    private static final String LOCKED = "locked";
    private static final String DISABLED = "disabled";
    private static final String EMPLOYED = "employed";
    private static final String LEAVE = "leave";
    private static final String RETIRED = "retired";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_MANAGER = "MANAGER";
    private static final String ROLE_USER = "USER";
    private static final String USER_ROLE_CODE = "USER_ROLE";
    private static final String DEFAULT_FOUNDATION_PASSWORD_HASH = "$2a$10$wuWXa/hwpl7jxTu1D6LTWu0GjOiIi.eKs0Pepl5tfBmGhEUZ96Z2a";

    private final UserAccountRepository userRepository;
    private final AuthorizationRepository authorizationRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;
    private final CodeRepository codeRepository;
    private final CodeDetailRepository codeDetailRepository;

    @Autowired
    public UserManagementService(
            UserAccountRepository userRepository,
            AuthorizationRepository authorizationRepository,
            UserAuthorizationRepository userAuthorizationRepository,
            CodeRepository codeRepository,
            CodeDetailRepository codeDetailRepository
    ) {
        this.userRepository = userRepository;
        this.authorizationRepository = authorizationRepository;
        this.userAuthorizationRepository = userAuthorizationRepository;
        this.codeRepository = codeRepository;
        this.codeDetailRepository = codeDetailRepository;
    }

    public UserManagementService(
            UserAccountRepository userRepository,
            AuthorizationRepository authorizationRepository,
            UserAuthorizationRepository userAuthorizationRepository
    ) {
        this(userRepository, authorizationRepository, userAuthorizationRepository, null, null);
    }

    public UserManagementService(UserAccountRepository userRepository) {
        this(userRepository, null, null, null, null);
    }

    @Transactional(readOnly = true)
    public UserListResponse listUsers(
            String actorUsername,
            String query,
            String roleId,
            String accountStatus,
            String employmentStatus,
            int page,
            int pageSize,
            String sort
    ) {
        requireAdmin(actorUsername);
        int safePage = Math.max(page, 1);
        int safePageSize = Math.min(Math.max(pageSize, 1), 100);
        Page<UserAccount> result = userRepository.findAll(
                buildSpecification(query, roleId, accountStatus, employmentStatus),
                PageRequest.of(safePage - 1, safePageSize, resolveSort(sort))
        );
        List<RoleSummaryDto> roles = availableRoles();
        List<UserAccountDto> items = result.getContent().stream().map(user -> toDto(user, roles)).toList();
        return new UserListResponse(items, result.getTotalElements(), safePage, safePageSize, summary(), roles);
    }

    @Transactional(readOnly = true)
    public UserAccountDto getUser(String actorUsername, Long userId) {
        requireAdmin(actorUsername);
        return toDto(findUser(userId), availableRoles());
    }

    @Transactional
    public UserAccountDto createUser(String actorUsername, UserMutationRequest request) {
        UserAccount actor = requireAdmin(actorUsername);
        validateMutation(request, false);
        if (userRepository.existsByUsernameIgnoreCase(request.username().trim())) {
            throw new ApiException("DUPLICATE_USERNAME", "이미 사용 중인 사용자 ID입니다.");
        }
        UserAccount user = UserAccount.builder()
                .username(request.username().trim())
                .passwordHash(DEFAULT_FOUNDATION_PASSWORD_HASH)
                .name(request.name().trim())
                .remarks(valueOrNull(request.displayName()))
                .email(valueOrNull(request.email()))
                .department(valueOrNull(request.department()))
                .position(valueOrNull(request.position()))
                .phone(valueOrNull(request.phone()))
                .role(resolveRole(request))
                .accountStatus(normalizeAccountStatus(request.accountStatus()))
                .employmentStatus(normalizeEmploymentStatus(request.employmentStatus()))
                .enabled(isEnabled(request.accountStatus(), request.employmentStatus()))
                .createdBy(actor.getUsername())
                .updatedBy(actor.getUsername())
                .build();
        if (Boolean.TRUE.equals(request.resetPassword())) {
            user.setPasswordHash(DEFAULT_FOUNDATION_PASSWORD_HASH);
        }
        UserAccount saved = userRepository.save(user);
        syncUserAuthorization(saved, saved.getRole());
        return toDto(saved, availableRoles());
    }

    @Transactional
    public UserAccountDto updateUser(String actorUsername, Long userId, UserMutationRequest request) {
        UserAccount actor = requireAdmin(actorUsername);
        UserAccount user = findUser(userId);
        validateMutation(request, true);
        if (!user.getUsername().equalsIgnoreCase(request.username().trim())) {
            throw new ApiException("USERNAME_IMMUTABLE", "사용자 ID는 변경할 수 없습니다.");
        }
        String nextRole = resolveRole(request);
        String nextAccountStatus = normalizeAccountStatus(request.accountStatus());
        String nextEmploymentStatus = normalizeEmploymentStatus(request.employmentStatus());
        protectAdminRemoval(actor, user, nextRole, nextAccountStatus, nextEmploymentStatus);
        user.setName(request.name().trim());
        user.setRemarks(valueOrNull(request.displayName()));
        if (Boolean.TRUE.equals(request.resetPassword())) {
            user.setPasswordHash(DEFAULT_FOUNDATION_PASSWORD_HASH);
        }
        user.setEmail(valueOrNull(request.email()));
        user.setDepartment(valueOrNull(request.department()));
        user.setPosition(valueOrNull(request.position()));
        user.setPhone(valueOrNull(request.phone()));
        user.setRole(nextRole);
        user.setAccountStatus(nextAccountStatus);
        user.setEmploymentStatus(nextEmploymentStatus);
        user.setEnabled(isEnabled(nextAccountStatus, nextEmploymentStatus));
        user.setUpdatedBy(actor.getUsername());
        user.setUpdatedTimestamp(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        UserAccount saved = userRepository.save(user);
        syncUserAuthorization(saved, nextRole);
        return toDto(saved, availableRoles());
    }

    @Transactional
    public UserAccountDto resetPassword(String actorUsername, Long userId) {
        UserAccount actor = requireAdmin(actorUsername);
        UserAccount user = findUser(userId);
        if (actor.getId().equals(user.getId())) {
            throw new ApiException("SELF_PASSWORD_RESET", "현재 로그인한 계정의 비밀번호는 초기화할 수 없습니다.");
        }
        user.setPasswordHash(null);
        user.setUpdatedBy(actor.getUsername());
        return toDto(userRepository.save(user), availableRoles());
    }

    @Transactional
    public UserAccountDto changeStatus(String actorUsername, Long userId, String action, UserDangerActionRequest request) {
        UserAccount actor = requireAdmin(actorUsername);
        UserAccount user = findUser(userId);
        UserDangerActionRequest safeRequest = request == null
                ? new UserDangerActionRequest(null, null, null, null)
                : request;
        String normalizedAction = action.toLowerCase(Locale.ROOT);
        if ("disable".equals(normalizedAction)) {
            protectAdminRemoval(actor, user, user.getRole(), DISABLED, user.getEmploymentStatus());
            user.setAccountStatus(DISABLED);
            user.setEnabled(false);
            user.setDataEndStatus("Y");
        } else if ("lock".equals(normalizedAction)) {
            protectAdminRemoval(actor, user, user.getRole(), LOCKED, user.getEmploymentStatus());
            user.setAccountStatus(LOCKED);
            user.setEnabled(false);
            user.setDataEndStatus("Y");
        } else if ("unlock".equals(normalizedAction)) {
            user.setAccountStatus(ACTIVE);
            user.setEnabled(EMPLOYED.equalsIgnoreCase(user.getEmploymentStatus()));
            user.setDataEndStatus("N");
        } else if ("retire".equals(normalizedAction)) {
            protectAdminRemoval(actor, user, user.getRole(), DISABLED, RETIRED);
            user.setEmploymentStatus(RETIRED);
            user.setAccountStatus(DISABLED);
            user.setEnabled(false);
            user.setDataEndStatus("Y");
        } else if ("delete-request".equals(normalizedAction)) {
            protectAdminRemoval(actor, user, user.getRole(), user.getAccountStatus(), user.getEmploymentStatus());
            if (!Boolean.TRUE.equals(safeRequest.confirmedImpact())) {
                throw new ApiException("CONFIRMATION_REQUIRED", "삭제 영향 확인이 필요합니다.");
            }
            user.setDeletionRequestedAt(LocalDateTime.now());
            user.setDeletionRequestedBy(actor.getUsername());
            user.setDeletionReason(valueOrNull(safeRequest.reason()));
            user.setDataEndStatus("Y");
        } else {
            throw new ApiException("VALIDATION_ERROR", "지원하지 않는 사용자 상태 변경입니다.");
        }
        user.setUpdatedBy(actor.getUsername());
        user.setUpdatedTimestamp(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return toDto(userRepository.save(user), availableRoles());
    }

    private Specification<UserAccount> buildSpecification(String query, String roleId, String accountStatus, String employmentStatus) {
        return (root, criteriaQuery, builder) -> {
            if (query == null || query.isBlank()) return builder.conjunction();
            String pattern = "%" + query.trim().toLowerCase(Locale.ROOT) + "%";
            return builder.or(
                    builder.like(builder.lower(root.get("username")), pattern),
                    builder.like(builder.lower(root.get("name")), pattern)
            );
        };
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) return Sort.by(Sort.Direction.ASC, "username");
        String[] parts = sort.split(",", 2);
        String property = switch (parts[0]) {
            case "username", "name" -> parts[0];
            default -> "username";
        };
        Sort.Direction direction = parts.length > 1 && "desc".equalsIgnoreCase(parts[1]) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, property);
    }

    private Map<String, Long> summary() {
        Map<String, Long> values = new HashMap<>();
        userRepository.findAll().forEach(user -> {
            String account = user.getAccountStatus() == null ? ACTIVE : user.getAccountStatus();
            String employment = user.getEmploymentStatus() == null ? EMPLOYED : user.getEmploymentStatus();
            values.merge(account + "Count", 1L, Long::sum);
            if (RETIRED.equalsIgnoreCase(employment)) values.merge("retiredCount", 1L, Long::sum);
        });
        return values;
    }

    private List<RoleSummaryDto> availableRoles() {
        if (codeRepository != null && codeDetailRepository != null) {
            return codeRepository.findByNameIgnoreCase(USER_ROLE_CODE)
                    .filter(code -> "N".equalsIgnoreCase(code.getDataEndStatus()))
                    .map(Code::getId)
                    .map(codeId -> codeDetailRepository.findAllByCodeIdAndDataEndStatusOrderBySortOrderAscIdAsc(codeId, "N").stream()
                            .map(detail -> new RoleSummaryDto(
                                    detail.getValue().toLowerCase(Locale.ROOT),
                                    firstNonBlank(detail.getNameKo(), detail.getName(), detail.getValue()),
                                    firstNonBlank(detail.getDescription(), detail.getRemarks(), ""),
                                    ROLE_ADMIN.equalsIgnoreCase(detail.getValue())
                            ))
                            .toList())
                    .filter(roles -> !roles.isEmpty())
                    .orElseGet(this::fallbackRoles);
        }
        return fallbackRoles();
    }

    private List<RoleSummaryDto> fallbackRoles() {
        return List.of(
                new RoleSummaryDto("admin", "최고관리자", "시스템 전체 관리와 사용자관리 접근", true),
                new RoleSummaryDto("manager", "관리자", "현장 운영 관리", false),
                new RoleSummaryDto("user", "일반 사용자", "허용된 화면 조회와 기본 사용", false)
        );
    }

    private UserAccountDto toDto(UserAccount user) {
        return toDto(user, availableRoles());
    }

    private UserAccountDto toDto(UserAccount user, List<RoleSummaryDto> roles) {
        user.setRole(resolveRoleCode(user));
        user.setAccountStatus("Y".equalsIgnoreCase(user.getDataEndStatus()) ? DISABLED : ACTIVE);
        user.setEnabled(!"Y".equalsIgnoreCase(user.getDataEndStatus()));
        return UserAccountDto.from(user, roles);
    }

    private UserAccount findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));
    }

    private UserAccount requireAdmin(String actorUsername) {
        if (actorUsername == null || actorUsername.isBlank()) {
            throw new ApiException("UNAUTHENTICATED", "인증된 사용자 정보가 필요합니다.");
        }
        UserAccount actor = userRepository.findByUsernameIgnoreCase(actorUsername.trim())
                .orElseThrow(() -> new ApiException("UNAUTHENTICATED", "인증된 사용자를 찾을 수 없습니다."));
        if (!isAdministrator(actor) || !ACTIVE.equalsIgnoreCase(actor.getAccountStatus()) || !EMPLOYED.equalsIgnoreCase(actor.getEmploymentStatus())) {
            throw new ApiException("FORBIDDEN", "사용자관리 관리자 권한이 필요합니다.");
        }
        return actor;
    }

    private boolean isAdministrator(UserAccount user) {
        if (ROLE_ADMIN.equalsIgnoreCase(user.getRole())) return true;
        if (authorizationRepository == null || userAuthorizationRepository == null) return false;
        return userAuthorizationRepository.findAllByUserIdAndDataEndStatus(user.getId(), "N").stream()
                .map(link -> authorizationRepository.findById(link.getAuthId()).orElse(null))
                .anyMatch(auth -> auth != null && ROLE_ADMIN.equalsIgnoreCase(auth.getCode()) && "N".equalsIgnoreCase(auth.getDataEndStatus()));
    }

    private void validateMutation(UserMutationRequest request, boolean update) {
        if (request == null || request.username() == null || request.username().isBlank()) throw new ApiException("VALIDATION_ERROR", "사용자 ID는 필수입니다.");
        if (request.name() == null || request.name().isBlank()) throw new ApiException("VALIDATION_ERROR", "사용자 이름은 필수입니다.");
        if (!update && request.username().trim().length() < 2) throw new ApiException("VALIDATION_ERROR", "사용자 ID는 2자 이상이어야 합니다.");
        normalizeAccountStatus(request.accountStatus());
        normalizeEmploymentStatus(request.employmentStatus());
    }

    private String resolveRole(UserMutationRequest request) {
        if (request.roleIds() == null || request.roleIds().isEmpty() || request.roleIds().get(0).isBlank()) return ROLE_USER;
        String role = request.roleIds().get(0).trim().toUpperCase(Locale.ROOT);
        if (!List.of(ROLE_ADMIN, ROLE_MANAGER, ROLE_USER).contains(role)) throw new ApiException("VALIDATION_ERROR", "지원하지 않는 역할입니다.");
        return role;
    }

    private String resolveRoleCode(UserAccount user) {
        if (authorizationRepository == null || userAuthorizationRepository == null || user.getId() == null) {
            String role = user.getRole() == null ? ROLE_USER : user.getRole().toUpperCase(Locale.ROOT);
            return List.of(ROLE_ADMIN, ROLE_MANAGER, ROLE_USER).contains(role) ? role : ROLE_USER;
        }
        List<String> codes = userAuthorizationRepository.findAllByUserIdAndDataEndStatus(user.getId(), "N").stream()
                .map(link -> authorizationRepository.findById(link.getAuthId()).orElse(null))
                .filter(auth -> auth != null && "N".equalsIgnoreCase(auth.getDataEndStatus()))
                .map(auth -> auth.getCode() == null ? "" : auth.getCode().toUpperCase(Locale.ROOT))
                .toList();
        if (codes.contains(ROLE_ADMIN)) return ROLE_ADMIN;
        if (codes.contains(ROLE_MANAGER)) return ROLE_MANAGER;
        if (codes.contains(ROLE_USER)) return ROLE_USER;
        return ROLE_USER;
    }

    private void syncUserAuthorization(UserAccount user, String role) {
        if (authorizationRepository == null || userAuthorizationRepository == null || user.getId() == null) return;
        userAuthorizationRepository.findAllByUserIdAndDataEndStatus(user.getId(), "N").forEach(link -> {
            link.setDataEndStatus("Y");
            userAuthorizationRepository.save(link);
        });
        authorizationRepository.findByCodeIgnoreCaseAndDataEndStatus(role, "N").ifPresent(auth -> userAuthorizationRepository.save(
                com.vision.entity.UserAuthorization.builder()
                        .userId(user.getId())
                        .authId(auth.getId())
                        .grantStartDate("20260101")
                        .dataEndStatus("N")
                        .build()
        ));
    }

    private String normalizeAccountStatus(String value) {
        String normalized = value == null || value.isBlank() ? ACTIVE : value.toLowerCase(Locale.ROOT);
        if (!List.of(ACTIVE, LOCKED, DISABLED).contains(normalized)) throw new ApiException("VALIDATION_ERROR", "지원하지 않는 계정 상태입니다.");
        return normalized;
    }

    private String normalizeEmploymentStatus(String value) {
        String normalized = value == null || value.isBlank() ? EMPLOYED : value.toLowerCase(Locale.ROOT);
        if (!List.of(EMPLOYED, LEAVE, RETIRED).contains(normalized)) throw new ApiException("VALIDATION_ERROR", "지원하지 않는 재직 상태입니다.");
        return normalized;
    }

    private boolean isEnabled(String accountStatus, String employmentStatus) {
        return ACTIVE.equalsIgnoreCase(normalizeAccountStatus(accountStatus)) && EMPLOYED.equalsIgnoreCase(normalizeEmploymentStatus(employmentStatus));
    }

    private void protectAdminRemoval(UserAccount actor, UserAccount target, String nextRole, String nextAccountStatus, String nextEmploymentStatus) {
        if (actor.getId().equals(target.getId()) && (ROLE_ADMIN.equalsIgnoreCase(target.getRole()) && (!ROLE_ADMIN.equalsIgnoreCase(nextRole) || !ACTIVE.equalsIgnoreCase(nextAccountStatus) || !EMPLOYED.equalsIgnoreCase(nextEmploymentStatus)))) {
            throw new ApiException("SELF_LOCKOUT_RISK", "현재 로그인한 관리자 계정은 잠글 수 없습니다.");
        }
        boolean removesActiveAdmin = ROLE_ADMIN.equalsIgnoreCase(target.getRole())
                && ACTIVE.equalsIgnoreCase(target.getAccountStatus())
                && EMPLOYED.equalsIgnoreCase(target.getEmploymentStatus())
                && (!ROLE_ADMIN.equalsIgnoreCase(nextRole) || !ACTIVE.equalsIgnoreCase(nextAccountStatus) || !EMPLOYED.equalsIgnoreCase(nextEmploymentStatus));
        if (removesActiveAdmin && userRepository.countByRoleIgnoreCaseAndAccountStatusAndEmploymentStatus("ADMIN", ACTIVE, EMPLOYED) <= 1) {
            throw new ApiException("LAST_ADMIN_RISK", "활성 관리자 계정이 최소 한 개는 필요합니다.");
        }
    }

    private String valueOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value.trim();
        }
        return "";
    }
}
