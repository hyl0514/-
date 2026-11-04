package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 预算计划 expense_plans
 */
@Data
@TableName("expense_plans")
public class ExpensePlan implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long tripId;

    private BigDecimal totalBudget;

    private String title;

    /** AI 生成的预算建议/复盘结果 JSON */
    private String aiResult;

    /** manual / ai */
    private String source;

    private LocalDateTime createdAt;
}
