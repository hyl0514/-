package org.example.traveljavaserver.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.dto.RouteRequestDTO;
import org.example.traveljavaserver.service.RoutePlanService;
import org.example.traveljavaserver.service.TravelPersistenceService;
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
    private final TravelPersistenceService persistenceService;

    /**
     * 生成 2-3 套候选路线方案，并自动落库
     */
    @PostMapping("/generate")
    public Result<MultiRouteVO> generate(@CurrentUser LoginUser me,
                                         @Valid @RequestBody RouteRequestDTO requestDTO) {
        try {
            MultiRouteVO vo = routePlanService.generateRoutes(
                    requestDTO.getOrigin(),
                    requestDTO.getDestination(),
                    requestDTO.getTravelDays(),
                    requestDTO.getPreference()
            );
            persistenceService.saveRoutePlans(me.userId(), requestDTO, vo);
            return Result.ok(vo);
        } catch (Exception e) {
            return Result.fail(500, "路线生成失败: " + e.getMessage());
        }
    }
}
