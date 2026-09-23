package org.example.traveljavaserver.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * AI 行李打包清单请求参数
 */
@Data
public class PackingRequestDTO {

    /**
     * 目的地
     */
    @NotBlank(message = "目的地不能为空")
    private String destination;

    /**
     * 出行总天数
     */
    @NotNull(message = "出行天数不能为空")
    @Min(value = 1, message = "出行天数不能小于1")
    @Max(value = 60, message = "出行天数不能大于60")
    private Integer travelDays;

    /**
     * 7天天气信息（温度区间、降水概率、紫外线等级、穿衣指数），可为空，为空时生成通用清单
     */
    private String weatherInfo;

    /**
     * 出行类型：旅游 / 出差，默认旅游
     */
    private String tripType;
}
