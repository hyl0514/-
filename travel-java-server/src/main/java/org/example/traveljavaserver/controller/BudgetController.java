package org.example.traveljavaserver.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.dto.BudgetAdviceDTO;
import org.example.traveljavaserver.service.BudgetService;
import org.example.traveljavaserver.service.TravelPersistenceService;
import org.example.traveljavaserver.vo.BudgetAdviceVO;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 预算智能分析接口
 */
@RestController
@RequestMapping("/api/travel/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final TravelPersistenceService persistenceService;

    /**
     * 预算临近上限时获取 AI 省钱建议，并写入 expense_plans
     */
    @PostMapping("/advice")
    public Result<BudgetAdviceVO> advice(@CurrentUser LoginUser me,
                                         @Valid @RequestBody BudgetAdviceDTO requestDTO) {
        try {
            BudgetAdviceVO vo = budgetService.savingAdvice(requestDTO);
            vo.setPlanId(persistenceService.saveBudgetAdvice(me.userId(), requestDTO, vo));
            return Result.ok(vo);
        } catch (Exception e) {
            return Result.fail(500, "省钱建议生成失败: " + e.getMessage());
        }
    }

    /**
     * 行程结束一键生成消费复盘报告，并写入 expense_plans
     */
    @PostMapping("/review")
    public Result<BudgetAdviceVO> review(@CurrentUser LoginUser me,
                                         @Valid @RequestBody BudgetAdviceDTO requestDTO) {
        try {
            BudgetAdviceVO vo = budgetService.reviewReport(requestDTO);
            vo.setPlanId(persistenceService.saveBudgetAdvice(me.userId(), requestDTO, vo));
            return Result.ok(vo);
        } catch (Exception e) {
            return Result.fail(500, "复盘报告生成失败: " + e.getMessage());
        }
    }
}
