package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 行程每日计划 trip_day_plans
 */
@Data
@TableName("trip_day_plans")
public class TripDayPlan implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long tripId;

    private Integer dayNo;

    private String dayTitle;

    /** 嵌套：当日的景点/点位 */
    @TableField(exist = false)
    private List<TripPoint> points;
}
