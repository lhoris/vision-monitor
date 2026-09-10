package com.vision.service;

import com.vision.entity.Code;
import com.vision.entity.CodeDetail;
import com.vision.repository.AuthorizationRepository;
import com.vision.repository.CodeDetailRepository;
import com.vision.repository.CodeRepository;
import com.vision.repository.UserAccountRepository;
import com.vision.repository.UserAuthorizationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommonCodeServiceTest {
    @Mock CodeRepository codeRepository;
    @Mock CodeDetailRepository detailRepository;
    @Mock UserAccountRepository userRepository;
    @Mock AuthorizationRepository authorizationRepository;
    @Mock UserAuthorizationRepository userAuthorizationRepository;
    @InjectMocks CommonCodeService service;

    @Test
    void bootstrapReturnsActiveCodesAndSortedDetails() {
        Code code = Code.builder().id(1L).name("ALERT_LEVEL").description("alerts").dataEndStatus("N").build();
        CodeDetail detail = CodeDetail.builder().id(2L).codeId(1L).value("HIGH").name("High").sortOrder(1).dataEndStatus("N").build();
        when(codeRepository.findAllByDataEndStatusOrderByNameAsc("N")).thenReturn(List.of(code));
        when(detailRepository.findAllByCodeIdAndDataEndStatusOrderBySortOrderAscIdAsc(1L, "N")).thenReturn(List.of(detail));

        var result = service.bootstrap();

        assertThat(result.getCodes()).containsKey("ALERT_LEVEL");
        assertThat(result.getCodes().get("ALERT_LEVEL").getItems()).extracting("value").containsExactly("HIGH");
    }
}
