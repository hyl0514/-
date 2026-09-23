package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 审核日志 audit_logs
 */
@Data
@TableName("audit_logs")
public class AuditLog implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long postId;

    private Long adminId;

    /** approve / reject */
    private String action;

    private String reason;

    private LocalDateTime createdAt;
}
