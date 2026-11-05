package org.example.traveljavaserver.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 挑战进度写入（幂等：同一用户 + 挑战只会有一行）
 */
@Data
public class ChallengeProgressDTO {
    private BigDecimal progress;
    /** 可选：completed 表示达成 */
    private String status;
}
