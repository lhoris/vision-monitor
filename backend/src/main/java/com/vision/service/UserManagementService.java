package com.vision.service;

import com.vision.dto.RoleSummaryDto;
import com.vision.dto.UserAccountDto;
import com.vision.dto.UserDangerActionRequest;
import com.vision.dto.UserListResponse;
import com.vision.dto.UserMutationRequest;
import com.vision.dto.OrgUnitDto;
import com.vision.entity.UserAccount;
import com.vision.entity.OrgUnit;
import com.vision.exception.ApiException;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.OrgUnitRepository;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.UserAuthorizationRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
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
    private static final String DEFAULT_FOUNDATION_PASSWORD_HASH = "$2a$10$wuWXa/hwpl7jxTu1D6LTWu0GjOiIi.eKs0Pepl5tfBmGhEUZ96Z2a";

    private final UserAccountRepository userRepository;
    private final OrgUnitRepository orgUnitRepository;
    private final AuthorizationRepository authorizationRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;

    @Autowired
    public UserManagementService(
            UserAccountRepository userRepository,
            OrgUnitRepository orgUnitRepository,
            AuthorizationRepository authorizationRepository,
            UserAuthorizationRepository userAuthorizationRepository
    ) {
        this.userRepository = userRepository;
        this.orgUnitRepository = orgUnitRepository;
        this.authorizationRepository = authorizationRepository;
        this.userAuthorizationRepository = userAuthorizationRepository;
    }

    public UserManagementService(UserAccountRepository userRepository, OrgUnitRepository orgUnitRepository) {
        this(userRepository, orgUnitRepository, null, null);
    }
    @Transactional(readOnly = true)
    public List<OrgUnitDto> listOrgUnits(String actorUsername, Long parentId, String unitType, boolean activeOnly) {
        requireAdmin(actorUsername);
        List<OrgUnit> units = activeOnly
                ? (parentId == null
                    ? orgUnitRepository.findAllByActiveTrueOrderByParentIdAscSortOrderAscNameAsc()
                    : orgUnitRepository.findAllByParentIdAndActiveTrueOrderBySortOrderAscNameAsc(parentId))
                : orgUnitRepository.findAll(Sort.by("parentId", "sortOrder", "name"));
        return units.stream()
                .filter(unit -> unitType == null || unitType.isBlank() || unit.getUnitType().equalsIgnoreCase(unitType))
                .map(OrgUnitDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserListResponse listUsers(
            String actorUsername,
            String query,
            Long orgUnitId,
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
                buildSpecification(query, orgUnitId, roleId, accountStatus, employmentStatus),
                PageRequest.of(safePage - 1, safePageSize, resolveSort(sort))
        );
        List<UserAccountDto> items = result.getContent().stream().map(this::toDto).toList();
        return new UserListResponse(items, result.getTotalElements(), safePage, safePageSize, summary(), availableRoles());
    }

    @Transactional(readOnly = true)
    public UserAccountDto getUser(String actorUsername, Long userId) {
        requireAdmin(actorUsername);
        return toDto(findUser(userId));
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
                .orgUnitId(validateOrgUnit(request.orgUnitId()))
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
        return toDto(userRepository.save(user));
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
        user.setOrgUnitId(validateOrgUnit(request.orgUnitId()));
        user.setRole(nextRole);
        user.setAccountStatus(nextAccountStatus);
        user.setEmploymentStatus(nextEmploymentStatus);
        user.setEnabled(isEnabled(nextAccountStatus, nextEmploymentStatus));
        user.setUpdatedBy(actor.getUsername());
        user.setUpdatedTimestamp(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return toDto(userRepository.save(user));
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
        return toDto(userRepository.save(user));
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
        return toDto(userRepository.save(user));
    }

    private Specification<UserAccount> buildSpecification(String query, Long orgUnitId, String roleId, String accountStatus, String employmentStatus) {
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
        return List.of(
                new RoleSummaryDto("admin", "ADMIN", "관리자 역할", true),
                new RoleSummaryDto("user", "USER", "일반 사용자 역할", false)
        );
    }

    private UserAccountDto toDto(UserAccount user) {
        user.setRole(isAdministrator(user) ? "ADMIN" : "USER");
        user.setAccountStatus("Y".equalsIgnoreCase(user.getDataEndStatus()) ? DISABLED : ACTIVE);
        user.setEnabled(!"Y".equalsIgnoreCase(user.getDataEndStatus()));
        String orgUnitName = user.getOrgUnitId() == null
                ? null
                : orgUnitRepository.findById(user.getOrgUnitId()).map(OrgUnit::getName).orElse(null);
        return UserAccountDto.from(user, orgUnitName);
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
        if ("ADMIN".equalsIgnoreCase(user.getRole())) return true;
        if (authorizationRepository == null || userAuthorizationRepository == null) return false;
        return userAuthorizationRepository.findAllByUserIdAndDataEndStatus(user.getId(), "N").stream()
                .map(link -> authorizationRepository.findById(link.getAuthId()).orElse(null))
                .anyMatch(auth -> auth != null && "ADMIN".equalsIgnoreCase(auth.getCode()) && "N".equalsIgnoreCase(auth.getDataEndStatus()));
    }

    private void validateMutation(UserMutationRequest request, boolean update) {
        if (request == null || request.username() == null || request.username().isBlank()) throw new ApiException("VALIDATION_ERROR", "사용자 ID는 필수입니다.");
        if (request.name() == null || request.name().isBlank()) throw new ApiException("VALIDATION_ERROR", "사용자 이름은 필수입니다.");
        if (!update && request.username().trim().length() < 2) throw new ApiException("VALIDATION_ERROR", "사용자 ID는 2자 이상이어야 합니다.");
        normalizeAccountStatus(request.accountStatus());
        normalizeEmploymentStatus(request.employmentStatus());
    }

    private Long validateOrgUnit(Long orgUnitId) {
        if (orgUnitId == null) return null;
        OrgUnit unit = orgUnitRepository.findById(orgUnitId)
                .orElseThrow(() -> new ApiException("ORG_UNIT_NOT_FOUND", "조직을 찾을 수 없습니다."));
        if (!Boolean.TRUE.equals(unit.getActive())) throw new ApiException("ORG_UNIT_INACTIVE", "비활성 조직은 지정할 수 없습니다.");
        return orgUnitId;
    }

    private String resolveRole(UserMutationRequest request) {
        if (request.roleIds() == null || request.roleIds().isEmpty() || request.roleIds().get(0).isBlank()) return "USER";
        String role = request.roleIds().get(0).trim().toUpperCase(Locale.ROOT);
        if (!role.equals("ADMIN") && !role.equals("USER")) throw new ApiException("VALIDATION_ERROR", "지원하지 않는 역할입니다.");
        return role;
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
        if (actor.getId().equals(target.getId()) && ("ADMIN".equalsIgnoreCase(target.getRole()) && (!"ADMIN".equalsIgnoreCase(nextRole) || !ACTIVE.equalsIgnoreCase(nextAccountStatus) || !EMPLOYED.equalsIgnoreCase(nextEmploymentStatus)))) {
            throw new ApiException("SELF_LOCKOUT_RISK", "현재 로그인한 관리자 계정은 잠글 수 없습니다.");
        }
        boolean removesActiveAdmin = "ADMIN".equalsIgnoreCase(target.getRole())
                && ACTIVE.equalsIgnoreCase(target.getAccountStatus())
                && EMPLOYED.equalsIgnoreCase(target.getEmploymentStatus())
                && (!"ADMIN".equalsIgnoreCase(nextRole) || !ACTIVE.equalsIgnoreCase(nextAccountStatus) || !EMPLOYED.equalsIgnoreCase(nextEmploymentStatus));
        if (removesActiveAdmin && userRepository.countByRoleIgnoreCaseAndAccountStatusAndEmploymentStatus("ADMIN", ACTIVE, EMPLOYED) <= 1) {
            throw new ApiException("LAST_ADMIN_RISK", "활성 관리자 계정이 최소 한 개는 필요합니다.");
        }
    }

    private String valueOrNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
