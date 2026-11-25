package com.vision.dto;

import java.util.List;
import java.util.Map;

public final class AlarmManagementDto {
    private AlarmManagementDto() { }

    public record ChannelPolicy(boolean receiver, boolean push, boolean email, boolean teams) { }

    public record TypePolicy(
            Long id, String code, String name, String nameKo, String nameEn, String description,
            String category, String acknowledgementScope) { }

    public record UserSetting(Long userId, String username, String name,
                              Map<String, ChannelPolicy> overrides) { }

    public record Overview(List<TypePolicy> types, List<UserSetting> users) { }

    public record TypePolicyUpdate(String category, String acknowledgementScope) { }

    public record TypePolicyCreate(String code, String name, String nameKo, String nameEn,
                                   String description, String category, String acknowledgementScope) { }

    public record UserSettingUpdate(Map<String, ChannelPolicy> overrides) { }
}
