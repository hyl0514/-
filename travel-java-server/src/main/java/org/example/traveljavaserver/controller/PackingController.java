package org.example.traveljavaserver.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.traveljavaserver.dto.PackingCheckDTO;
import org.example.traveljavaserver.dto.PackingRequestDTO;
import org.example.traveljavaserver.service.PackingService;
import org.example.traveljavaserver.vo.PackingCheckVO;
import org.example.traveljavaserver.vo.PackingListVO;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI 行李打包清单接口
 */
@RestController
@RequestMapping("/api/travel/packing")
@RequiredArgsConstructor
public class PackingController {

    private final PackingService packingService;

    /**
     * 根据行程信息生成结构化行李打包清单
     */
    @PostMapping("/generate")
    public Result<PackingListVO> generate(@Valid @RequestBody PackingRequestDTO requestDTO) {
        try {
            PackingListVO packingListVO = packingService.generate(
                    requestDTO.getDestination(),
                    requestDTO.getTravelDays(),
                    requestDTO.getWeatherInfo(),
                    requestDTO.getTripType()
            );
            return Result.ok(packingListVO);
        } catch (Exception e) {
            return Result.fail(500, "行李清单生成失败: " + e.getMessage());
        }
    }

    /**
     * AI 检测当前清单可能遗漏的物品
     */
    @PostMapping("/check")
    public Result<PackingCheckVO> check(@Valid @RequestBody PackingCheckDTO requestDTO) {
        try {
            PackingCheckVO vo = packingService.checkMissing(
                    requestDTO.getDestination(),
                    requestDTO.getTravelDays(),
                    requestDTO.getWeatherInfo(),
                    requestDTO.getTripType(),
                    requestDTO.getItemNames()
            );
            return Result.ok(vo);
        } catch (Exception e) {
            return Result.fail(500, "缺失检测失败: " + e.getMessage());
        }
    }
}
