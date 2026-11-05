package org.example.traveljavaserver.vo;

import lombok.Data;
import org.example.traveljavaserver.entity.UserBadge;
import org.example.traveljavaserver.entity.UserChallenge;

import java.util.List;

/**
 * 我的成就与挑战进度
 */
@Data
public class AchievementVO {

    /** 已解锁徽章 */
    private List<UserBadge> badges;

    /** 挑战进度 */
    private List<UserChallenge> challenges;

    /** 挑战胜场合计 */
    private Integer wins;
}
