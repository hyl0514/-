package org.example.traveljavaserver.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 预算分析请求参数（省钱建议与消费复盘共用）
 */
@Data
public class BudgetAdviceDTO {

    /**
     * 目的地
     */
    private String destination;

    /**
     * 总预算（元）
     */
    @NotNull(message = "总预算不能为空")
    private Integer totalBudget;

    /**
     * 预估总花费（元）
     */
    private Integer estimatedCost;

    /**
     * 实际已花费（元）
     */
    private Integer actualCost;

    /**
     * 账单条目
     */
    private List<BillItem> bills;

    /**
     * 账单条目
     */
    @Data
    public static class BillItem {
        /**
         * 来源：ai 自动预估 / manual 手动记账
         */
        private String source;

        /**
         * 消费类别
         */
        private String category;

        /**
         * 消费用途
         */
        private String purpose;

        /**
         * 金额（元）
         */
        private Integer amount;
    }
}
