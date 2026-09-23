package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 社区帖子 community_posts
 */
@Data
@TableName("community_posts")
public class CommunityPost implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String authorName;

    private String authorAvatar;

    private String level;

    private String title;

    private String content;

    private String city;

    private String cat;

    /** tags，JSON 字符串 */
    private String tags;

    /** images，JSON 字符串 */
    private String images;

    /** pending / approved / rejected */
    private String status;

    private String rejectReason;

    private Integer likes;

    private Integer comments;

    private Integer views;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
