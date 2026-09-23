package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 行程点位 trip_points
 */
@Data
@TableName("trip_points")
public class TripPoint implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long dayPlanId;

    private String name;

    /** spot / food / hotel / transport */
    private String pointType;

    private String timeSlot;

    private BigDecimal estCost;

    private String note;

    private Integer sortOrder;
}
