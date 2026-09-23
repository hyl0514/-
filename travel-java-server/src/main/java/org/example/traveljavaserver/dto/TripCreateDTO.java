package org.example.traveljavaserver.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 新增行程请求（含 dayPlans + points 嵌套）
 */
@Data
public class TripCreateDTO {
    private Long id;
    private String name;
    private String origin;
    private String destination;
    private Integer days;
    private Integer people;
    private java.math.BigDecimal cost;
    private String status;
    private String bg;
    private String summary;
    private String tags;

    @Data
    public static class DayPlan {
        private Integer dayNo;
        private String dayTitle;
        private java.util.List<Point> points;
    }

    @Data
    public static class Point {
        private String name;
        private String pointType;
        private String timeSlot;
        private java.math.BigDecimal estCost;
        private String note;
        private Integer sortOrder;
    }

    @NotNull(message = "dayPlans 不能为空")
    private java.util.List<DayPlan> dayPlans;
}
