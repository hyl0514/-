package org.example.traveljavaserver.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * AI 行李缺失检测请求参数
 */
@Data
public class PackingCheckDTO {

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
     * 天气信息，可为空
     */
    private String weatherInfo;

    /**
     * 出行类型：旅游 / 出差
     */
    private String tripType;

    /**
     * 用户当前清单中已包含的物品名称列表
     */
    private List<String> itemNames;
}
