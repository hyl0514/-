package org.example.traveljavaserver.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.traveljavaserver.entity.UserBadge;
import org.example.traveljavaserver.entity.UserChallenge;
import org.example.traveljavaserver.mapper.UserBadgeMapper;
import org.example.traveljavaserver.mapper.UserChallengeMapper;
import org.example.traveljavaserver.vo.AchievementVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * 成就徽章 / 挑战进度持久化
 * 所有查询都限定 userId，保证只能读写当前登录用户自己的数据。
 */
@Service
public class AchievementService {

    private static final int BADGE_KEY_MAX_LENGTH = 64;

    private final UserBadgeMapper badgeMapper;
    private final UserChallengeMapper challengeMapper;

    public AchievementService(UserBadgeMapper badgeMapper,
                              UserChallengeMapper challengeMapper) {
        this.badgeMapper = badgeMapper;
        this.challengeMapper = challengeMapper;
    }

    /** 我的成就与挑战进度 */
    public AchievementVO getMine(Long userId) {
        List<UserBadge> badges = badgeMapper.selectList(
                new LambdaQueryWrapper<UserBadge>()
                        .eq(UserBadge::getUserId, userId)
                        .orderByAsc(UserBadge::getUnlockedAt)
        );
        List<UserChallenge> challenges = challengeMapper.selectList(
                new LambdaQueryWrapper<UserChallenge>()
                        .eq(UserChallenge::getUserId, userId)
                        .orderByAsc(UserChallenge::getJoinedAt)
        );
        int wins = challenges.stream()
                .mapToInt(c -> c.getWinCount() == null ? 0 : c.getWinCount())
                .sum();

        AchievementVO vo = new AchievementVO();
        vo.setBadges(badges);
        vo.setChallenges(challenges);
        vo.setWins(wins);
        return vo;
    }

    /**
     * 批量解锁徽章：已存在的跳过，重复调用不会产生重复记录
     */
    @Transactional(rollbackFor = Exception.class)
    public AchievementVO unlockBadges(Long userId, List<String> keys) {
        if (keys != null) {
            LinkedHashSet<String> distinct = new LinkedHashSet<>();
            for (String raw : keys) {
                if (raw == null) continue;
                String key = raw.trim();
                if (key.isEmpty() || key.length() > BADGE_KEY_MAX_LENGTH) continue;
                distinct.add(key);
            }
            for (String key : distinct) {
                Long exists = badgeMapper.selectCount(
                        new LambdaQueryWrapper<UserBadge>()
                                .eq(UserBadge::getUserId, userId)
                                .eq(UserBadge::getBadgeKey, key)
                );
                if (exists != null && exists > 0) continue;

                UserBadge badge = new UserBadge();
                badge.setUserId(userId);
                badge.setBadgeKey(key);
                badge.setUnlockedAt(LocalDateTime.now());
                badgeMapper.insert(badge);
            }
        }
        return getMine(userId);
    }

    /**
     * 加入挑战：已有记录直接返回，不重复插入
     */
    @Transactional(rollbackFor = Exception.class)
    public UserChallenge joinChallenge(Long userId, String challengeKey) {
        UserChallenge exists = findChallenge(userId, challengeKey);
        if (exists != null) return exists;

        UserChallenge row = newChallenge(userId, challengeKey);
        challengeMapper.insert(row);
        return row;
    }

    /**
     * 写入挑战进度（幂等 upsert）：同一用户 + 同一挑战只保留一行
     */
    @Transactional(rollbackFor = Exception.class)
    public UserChallenge saveProgress(Long userId, String challengeKey,
                                      BigDecimal progress, String status) {
        UserChallenge row = findChallenge(userId, challengeKey);
        boolean created = false;
        if (row == null) {
            row = newChallenge(userId, challengeKey);
            created = true;
        }
        if (progress != null) {
            row.setProgress(progress.max(BigDecimal.ZERO));
        }
        if ("completed".equalsIgnoreCase(status)
                && !"completed".equalsIgnoreCase(row.getStatus())) {
            row.setStatus("completed");
            row.setCompletedAt(LocalDateTime.now());
        }

        if (created) {
            challengeMapper.insert(row);
        } else {
            challengeMapper.updateById(row);
        }
        return row;
    }

    /**
     * 完成挑战：首次完成才累加胜场，重复调用保持幂等
     */
    @Transactional(rollbackFor = Exception.class)
    public UserChallenge completeChallenge(Long userId, String challengeKey, boolean won) {
        UserChallenge row = findChallenge(userId, challengeKey);
        boolean created = false;
        if (row == null) {
            row = newChallenge(userId, challengeKey);
            created = true;
        }
        if (!"completed".equalsIgnoreCase(row.getStatus())) {
            row.setStatus("completed");
            row.setCompletedAt(LocalDateTime.now());
            if (won) {
                row.setWinCount((row.getWinCount() == null ? 0 : row.getWinCount()) + 1);
            }
        }

        if (created) {
            challengeMapper.insert(row);
        } else {
            challengeMapper.updateById(row);
        }
        return row;
    }

    private UserChallenge findChallenge(Long userId, String challengeKey) {
        return challengeMapper.selectOne(
                new LambdaQueryWrapper<UserChallenge>()
                        .eq(UserChallenge::getUserId, userId)
                        .eq(UserChallenge::getChallengeKey, challengeKey.trim())
        );
    }

    private UserChallenge newChallenge(Long userId, String challengeKey) {
        UserChallenge row = new UserChallenge();
        row.setUserId(userId);
        row.setChallengeKey(challengeKey.trim());
        row.setStatus("joined");
        row.setProgress(BigDecimal.ZERO);
        row.setWinCount(0);
        row.setJoinedAt(LocalDateTime.now());
        return row;
    }
}
