package org.example.traveljavaserver.dto;

import lombok.Data;

import java.util.List;

/**
 * 批量写入已解锁徽章（幂等，已存在的不会重复插入）
 */
@Data
public class BadgeUnlockDTO {
    private List<String> keys;
}
