package org.example.traveljavaserver.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 沿途场所推荐请求参数
 */
@Data
public class PoiRequestDTO {

    /**
     * 目的地城市
     */
    @NotBlank(message = "目的地不能为空")
    private String destination;

    /**
     * 当前选中路线的每日点位上下文（将路线点位名称按天拼接）
     */
    private String routeContext;
}
