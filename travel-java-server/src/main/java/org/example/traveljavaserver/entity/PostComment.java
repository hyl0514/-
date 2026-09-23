package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 帖子评论 post_comments
 */
@Data
@TableName("post_comments")
public class PostComment implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long postId;

    private Long userId;

    private Long parentId;

    private Long replyTo;

    private String content;

    private LocalDateTime createdAt;
}
