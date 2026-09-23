package org.example.traveljavaserver.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 多路线 AI 生成请求参数
 */
@Data
public class RouteRequestDTO {

    /**
     * 出发地（可留空，默认异地出发）
     */
    private String origin;

    /**
     * 目的地
     */
    @NotBlank(message = "目的地不能为空")
    private String destination;

    /**
     * 出行天数
     */
    @NotNull(message = "出行天数不能为空")
    @Min(value = 1, message = "出行天数不能小于1")
    @Max(value = 30, message = "出行天数不能大于30")
    private Integer travelDays;

    /**
     * 出行偏好：休闲 / 美食 / 小众打卡
     */
    private String preference;
}
