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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AI 多路线规划接口
 */
@RestController
@RequestMapping("/api/travel/routes")
@RequiredArgsConstructor
public class RoutePlanController {

    private final RoutePlanService routePlanService;
    private final TravelPersistenceService persistenceService;

    /** 轻量结果缓存：同一用户 + 同样参数在 10 分钟内直接复用，避免重复等待大模型 */
    private static final long CACHE_TTL_MS = 10 * 60 * 1000L;
    private final Map<String, CachedRoutes> routeCache = new ConcurrentHashMap<>();

    private static class CachedRoutes {
        final MultiRouteVO vo;
        final long createdAt;

        CachedRoutes(MultiRouteVO vo, long createdAt) {
            this.vo = vo;
            this.createdAt = createdAt;
        }
    }

    private String cacheKey(Long userId, RouteRequestDTO dto) {
        String origin = dto.getOrigin() == null ? "" : dto.getOrigin().trim();
        String preference = dto.getPreference() == null || dto.getPreference().trim().isEmpty()
                ? "休闲" : dto.getPreference().trim();
        return userId + "|" + origin + "|" + dto.getDestination().trim()
                + "|" + dto.getTravelDays() + "|" + preference;
    }

    /**
     * 生成 2-3 套候选路线方案，并自动落库
     */
    @PostMapping("/generate")
    public Result<MultiRouteVO> generate(@CurrentUser LoginUser me,
                                         @Valid @RequestBody RouteRequestDTO requestDTO) {
        String key = cacheKey(me.userId(), requestDTO);
        CachedRoutes cached = routeCache.get(key);
        if (cached != null && System.currentTimeMillis() - cached.createdAt < CACHE_TTL_MS) {
            return Result.ok(cached.vo);
        }
        try {
            MultiRouteVO vo = routePlanService.generateRoutes(
                    requestDTO.getOrigin(),
                    requestDTO.getDestination(),
                    requestDTO.getTravelDays(),
                    requestDTO.getPreference()
            );
            persistenceService.saveRoutePlans(me.userId(), requestDTO, vo);
            routeCache.put(key, new CachedRoutes(vo, System.currentTimeMillis()));
            return Result.ok(vo);
        } catch (Exception e) {
            return Result.fail(500, "路线生成失败: " + e.getMessage());
        }
    }
}
