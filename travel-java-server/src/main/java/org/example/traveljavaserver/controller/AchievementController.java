package org.example.traveljavaserver.controller;

import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.dto.BadgeUnlockDTO;
import org.example.traveljavaserver.dto.ChallengeCompleteDTO;
import org.example.traveljavaserver.dto.ChallengeProgressDTO;
import org.example.traveljavaserver.entity.UserChallenge;
import org.example.traveljavaserver.service.AchievementService;
import org.example.traveljavaserver.vo.AchievementVO;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

/**
 * 成就与挑战 —— 需 JWT，只操作当前登录用户自己的数据
 */
@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private static final int CHALLENGE_KEY_MAX_LENGTH = 32;

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    /**
     * 查询我的已解锁徽章与挑战进度
     */
    @GetMapping("/me")
    public Result<AchievementVO> mine(@CurrentUser LoginUser me) {
        return Result.ok(achievementService.getMine(me.userId()));
    }

    /**
     * 批量写入已解锁徽章（幂等，重复调用不产生重复记录）
     */
    @PostMapping("/badges")
    public Result<AchievementVO> unlockBadges(@CurrentUser LoginUser me,
                                              @RequestBody BadgeUnlockDTO dto) {
        return Result.ok(achievementService.unlockBadges(me.userId(), dto.getKeys()));
    }

    /**
     * 加入挑战（已加入则直接返回原记录）
     */
    @PostMapping("/challenges/{key}/join")
    public Result<UserChallenge> join(@CurrentUser LoginUser me,
                                      @PathVariable String key) {
        if (invalidKey(key)) return Result.fail(400, "挑战标识不合法");
        return Result.ok(achievementService.joinChallenge(me.userId(), key));
    }

    /**
     * 写入 / 更新挑战进度（同一用户 + 挑战只会有一行）
     */
    @PutMapping("/challenges/{key}/progress")
    public Result<UserChallenge> progress(@CurrentUser LoginUser me,
                                          @PathVariable String key,
                                          @RequestBody ChallengeProgressDTO dto) {
        if (invalidKey(key)) return Result.fail(400, "挑战标识不合法");
        return Result.ok(achievementService.saveProgress(
                me.userId(), key, dto.getProgress(), dto.getStatus()));
    }

    /**
     * 完成挑战并累加胜场（仅首次完成累加，重复调用不变）
     */
    @PostMapping("/challenges/{key}/complete")
    public Result<UserChallenge> complete(@CurrentUser LoginUser me,
                                          @PathVariable String key,
                                          @RequestBody(required = false) ChallengeCompleteDTO dto) {
        if (invalidKey(key)) return Result.fail(400, "挑战标识不合法");
        boolean won = dto != null && Boolean.TRUE.equals(dto.getWon());
        return Result.ok(achievementService.completeChallenge(me.userId(), key, won));
    }

    private boolean invalidKey(String key) {
        return key == null || key.isBlank() || key.trim().length() > CHALLENGE_KEY_MAX_LENGTH;
    }
}
