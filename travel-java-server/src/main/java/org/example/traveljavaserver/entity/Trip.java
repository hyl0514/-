package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 行程 trips
 */
@Data
@TableName("trips")
public class Trip implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String name;

    private String origin;

    private String destination;

    private Integer days;

    private Integer people;

    private BigDecimal cost;

    /** planning / ongoing / finished */
    private String status;

    private String bg;

    private String summary;

    /** tags，逗号分隔 */
    private String tags;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /** 嵌套：每日行程计划 */
    @TableField(exist = false)
    private List<TripDayPlan> dayPlans;
}
