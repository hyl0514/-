package org.example.traveljavaserver.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.traveljavaserver.dto.RouteRequestDTO;
import org.example.traveljavaserver.service.RoutePlanService;
import org.example.traveljavaserver.vo.MultiRouteVO;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI 多路线规划接口
 */
@RestController
@RequestMapping("/api/travel/routes")
@RequiredArgsConstructor
public class RoutePlanController {

    private final RoutePlanService routePlanService;

    /**
     * 生成 2-3 套候选路线方案
     */
    @PostMapping("/generate")
    public Result<MultiRouteVO> generate(@Valid @RequestBody RouteRequestDTO requestDTO) {
        try {
            MultiRouteVO vo = routePlanService.generateRoutes(
                    requestDTO.getOrigin(),
                    requestDTO.getDestination(),
                    requestDTO.getTravelDays(),
                    requestDTO.getPreference()
            );
            return Result.ok(vo);
        } catch (Exception e) {
            return Result.fail(500, "路线生成失败: " + e.getMessage());
        }
    }
}
