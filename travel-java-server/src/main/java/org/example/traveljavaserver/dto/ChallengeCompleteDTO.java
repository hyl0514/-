package org.example.traveljavaserver.dto;

import lombok.Data;

/**
 * 挑战完成 / 胜场累加
 */
@Data
public class ChallengeCompleteDTO {
    /** true=挑战胜利，胜场 +1（仅首次完成时累加） */
    private Boolean won;
}
