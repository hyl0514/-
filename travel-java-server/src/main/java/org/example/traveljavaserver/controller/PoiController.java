package org.example.traveljavaserver.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.traveljavaserver.dto.PoiRequestDTO;
import org.example.traveljavaserver.service.PoiService;
import org.example.traveljavaserver.vo.PoiRecommendVO;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 沿途场所推荐接口
 */
@RestController
@RequestMapping("/api/travel/poi")
@RequiredArgsConstructor
public class PoiController {

    private final PoiService poiService;

    /**
     * 根据选中路线推荐周边酒店、景点、餐饮、娱乐场所
     */
    @PostMapping("/recommend")
    public Result<PoiRecommendVO> recommend(@Valid @RequestBody PoiRequestDTO requestDTO) {
        try {
            PoiRecommendVO vo = poiService.recommend(requestDTO.getDestination(), requestDTO.getRouteContext());
            return Result.ok(vo);
        } catch (Exception e) {
            return Result.fail(500, "场所推荐失败: " + e.getMessage());
        }
    }
}
