package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户挑战进度 user_challenges
 */
@Data
@TableName("user_challenges")
public class UserChallenge implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** 挑战标识，对应前端 CHALLENGE_TEMPLATES.id */
    private String challengeKey;

    /** joined / completed */
    private String status;

    private BigDecimal progress;

    /** 胜场次数，完成时 +1（重复调用不重复累加） */
    private Integer winCount;

    private LocalDateTime joinedAt;

    private LocalDateTime completedAt;

    private LocalDateTime updatedAt;
}
