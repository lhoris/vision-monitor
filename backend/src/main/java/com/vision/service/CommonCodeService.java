package com.vision.service;

import com.vision.dto.CommonCodeDetailDto;
import com.vision.dto.CommonCodeDto;
import com.vision.dto.RuntimeCommonCodeDto;
import com.vision.entity.Code;
import com.vision.entity.CodeDetail;
import com.vision.entity.UserAccount;
import com.vision.exception.ApiException;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.CodeDetailRepository;
import com.vision.repository.CodeRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAuthorizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommonCodeService {
    private static final String ACTIVE = "N";
    private static final String INACTIVE = "Y";

    private final CodeRepository codeRepository;
    private final CodeDetailRepository detailRepository;
    private final UserAccountRepository userRepository;
    private final AuthorizationRepository authorizationRepository;
    private final UserAuthorizationRepository userAuthorizationRepository;

    @Transactional(readOnly = true)
    public RuntimeCommonCodeDto bootstrap() {
        return toRuntime(codeRepository.findAllByDataEndStatusOrderByNameAsc(ACTIVE));
    }

    @Transactional(readOnly = true)
    public RuntimeCommonCodeDto findRuntime(String names) {
        if (names == null || names.isBlank()) return bootstrap();
        List<String> requested = Arrays.stream(names.split(",")).map(this::normalizeName).filter(value -> !value.isBlank()).toList();
        List<Code> codes = codeRepository.findAllByDataEndStatusOrderByNameAsc(ACTIVE).stream()
                .filter(code -> requested.contains(code.getName().toUpperCase(Locale.ROOT))).toList();
        return toRuntime(codes);
    }

    @Transactional(readOnly = true)
    public RuntimeCommonCodeDto findRuntimeByName(String name) {
        Code code = codeRepository.findByNameIgnoreCase(normalizeName(name))
                .filter(value -> ACTIVE.equals(value.getDataEndStatus()))
                .orElseThrow(() -> new ApiException("CODE_NOT_FOUND", "공통코드를 찾을 수 없습니다."));
        return toRuntime(List.of(code));
    }

    @Transactional(readOnly = true)
    public List<CommonCodeDto> listAdmin(String actorUsername) {
        requireAdmin(actorUsername);
        return codeRepository.findAllByOrderByNameAsc().stream().map(this::toAdminDto).toList();
    }

    @Transactional(readOnly = true)
    public List<CommonCodeDetailDto> listDetails(String actorUsername, Long codeId) {
        requireAdmin(actorUsername);
        findCode(codeId);
        return detailRepository.findAllByCodeIdOrderBySortOrderAscIdAsc(codeId).stream().map(CommonCodeDetailDto::from).toList();
    }

    @Transactional
    public CommonCodeDto createCode(String actorUsername, CommonCodeDto request) {
        requireAdmin(actorUsername);
        validateCode(request);
        String name = normalizeName(request.getName());
        if (codeRepository.existsByNameIgnoreCase(name)) throw new ApiException("DUPLICATE_CODE", "이미 등록된 공통코드입니다.");
        Code saved = codeRepository.save(Code.builder().name(name).description(trimOrNull(request.getDescription()))
                .type(trimOrNull(request.getType())).remarks(trimOrNull(request.getRemarks())).dataEndStatus(ACTIVE).build());
        return toAdminDto(saved);
    }

    @Transactional
    public CommonCodeDto updateCode(String actorUsername, Long id, CommonCodeDto request) {
        requireAdmin(actorUsername);
        validateCode(request);
        Code code = findCode(id);
        String name = normalizeName(request.getName());
        codeRepository.findByNameIgnoreCase(name).filter(found -> !found.getId().equals(id))
                .ifPresent(found -> { throw new ApiException("DUPLICATE_CODE", "이미 등록된 공통코드입니다."); });
        code.setName(name); code.setDescription(trimOrNull(request.getDescription())); code.setType(trimOrNull(request.getType())); code.setRemarks(trimOrNull(request.getRemarks()));
        return toAdminDto(codeRepository.save(code));
    }

    @Transactional
    public void deactivateCode(String actorUsername, Long id) {
        requireAdmin(actorUsername);
        Code code = findCode(id); code.setDataEndStatus(INACTIVE); codeRepository.save(code);
        detailRepository.findAllByCodeIdAndDataEndStatusOrderBySortOrderAscIdAsc(id, ACTIVE).forEach(detail -> { detail.setDataEndStatus(INACTIVE); detailRepository.save(detail); });
    }

    @Transactional
    public CommonCodeDetailDto createDetail(String actorUsername, Long codeId, CommonCodeDetailDto request) {
        requireAdmin(actorUsername); findCode(codeId); validateDetail(request);
        String value = normalizeValue(request.getValue());
        if (detailRepository.existsByCodeIdAndValueIgnoreCaseAndDataEndStatus(codeId, value, ACTIVE)) throw new ApiException("DUPLICATE_CODE_VALUE", "이미 등록된 코드값입니다.");
        CodeDetail saved = detailRepository.save(CodeDetail.builder().codeId(codeId).value(value).name(request.getName().trim())
                .description(trimOrNull(request.getDescription())).sortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder())
                .defaultValue(trimOrNull(request.getDefaultValue())).remarks(trimOrNull(request.getRemarks())).dataEndStatus(ACTIVE).build());
        return CommonCodeDetailDto.from(saved);
    }

    @Transactional
    public CommonCodeDetailDto updateDetail(String actorUsername, Long codeId, Long detailId, CommonCodeDetailDto request) {
        requireAdmin(actorUsername); findCode(codeId); validateDetail(request);
        CodeDetail detail = detailRepository.findById(detailId).filter(value -> codeId.equals(value.getCodeId()))
                .orElseThrow(() -> new ApiException("CODE_DETAIL_NOT_FOUND", "공통코드 상세값을 찾을 수 없습니다."));
        String value = normalizeValue(request.getValue());
        if (detailRepository.existsByCodeIdAndValueIgnoreCaseAndIdNot(codeId, value, detailId)) throw new ApiException("DUPLICATE_CODE_VALUE", "이미 등록된 코드값입니다.");
        detail.setValue(value); detail.setName(request.getName().trim()); detail.setDescription(trimOrNull(request.getDescription()));
        detail.setSortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder()); detail.setDefaultValue(trimOrNull(request.getDefaultValue())); detail.setRemarks(trimOrNull(request.getRemarks()));
        return CommonCodeDetailDto.from(detailRepository.save(detail));
    }

    @Transactional
    public void deactivateDetail(String actorUsername, Long codeId, Long detailId) {
        requireAdmin(actorUsername); findCode(codeId);
        CodeDetail detail = detailRepository.findById(detailId).filter(value -> codeId.equals(value.getCodeId()))
                .orElseThrow(() -> new ApiException("CODE_DETAIL_NOT_FOUND", "공통코드 상세값을 찾을 수 없습니다."));
        detail.setDataEndStatus(INACTIVE); detailRepository.save(detail);
    }

    private RuntimeCommonCodeDto toRuntime(List<Code> codes) {
        Map<String, RuntimeCommonCodeDto.CommonCodeGroupDto> result = new LinkedHashMap<>();
        codes.forEach(code -> result.put(code.getName().toUpperCase(Locale.ROOT), RuntimeCommonCodeDto.CommonCodeGroupDto.builder()
                .code(code.getName()).description(code.getDescription()).type(code.getType())
                .items(detailRepository.findAllByCodeIdAndDataEndStatusOrderBySortOrderAscIdAsc(code.getId(), ACTIVE).stream().map(detail -> RuntimeCommonCodeDto.CommonCodeItemDto.builder()
                        .id(detail.getId()).value(detail.getValue()).name(detail.getName()).description(detail.getDescription()).sortOrder(detail.getSortOrder()).defaultValue(detail.getDefaultValue()).build()).toList()).build()));
        return RuntimeCommonCodeDto.builder().version(Instant.now().toString()).codes(result).build();
    }

    private CommonCodeDto toAdminDto(Code code) { return CommonCodeDto.from(code, detailRepository.findAllByCodeIdOrderBySortOrderAscIdAsc(code.getId()).stream().map(CommonCodeDetailDto::from).toList()); }
    private Code findCode(Long id) { return codeRepository.findById(id).orElseThrow(() -> new ApiException("CODE_NOT_FOUND", "공통코드를 찾을 수 없습니다.")); }
    private void validateCode(CommonCodeDto request) { if (request == null || request.getName() == null || request.getName().isBlank()) throw new ApiException("VALIDATION_ERROR", "공통코드 식별자는 필수입니다."); }
    private void validateDetail(CommonCodeDetailDto request) { if (request == null || request.getValue() == null || request.getValue().isBlank()) throw new ApiException("VALIDATION_ERROR", "코드값은 필수입니다."); if (request.getName() == null || request.getName().isBlank()) throw new ApiException("VALIDATION_ERROR", "코드값명은 필수입니다."); }
    private String normalizeName(String value) { return value == null ? "" : value.trim().toUpperCase(Locale.ROOT); }
    private String normalizeValue(String value) { return value == null ? "" : value.trim(); }
    private String trimOrNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private UserAccount requireAdmin(String username) { if (username == null || username.isBlank()) throw new ApiException("UNAUTHENTICATED", "인증된 사용자가 필요합니다."); UserAccount actor = userRepository.findByUsernameIgnoreCase(username.trim()).orElseThrow(() -> new ApiException("UNAUTHENTICATED", "인증된 사용자를 찾을 수 없습니다.")); boolean admin = userAuthorizationRepository.findAllByUserIdAndDataEndStatus(actor.getId(), ACTIVE).stream().map(link -> authorizationRepository.findById(link.getAuthId()).orElse(null)).anyMatch(auth -> auth != null && "ADMIN".equalsIgnoreCase(auth.getCode()) && ACTIVE.equals(auth.getDataEndStatus())); if (!admin) throw new ApiException("FORBIDDEN", "관리자 권한이 필요합니다."); return actor; }
}
