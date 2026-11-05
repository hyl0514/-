package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户成就徽章 user_badges
 */
@Data
@TableName("user_badges")
public class UserBadge implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** 徽章标识，对应前端 BADGE_DEFS.id */
    private String badgeKey;

    private LocalDateTime unlockedAt;
}
