package org.example.traveljavaserver.vo;

import lombok.Data;

/**
 * 预算分析返回结构（省钱建议与消费复盘共用，按场景填充对应字段）
 */
@Data
public class BudgetAdviceVO {

    /**
     * 落库后的预算方案 id
     */
    private Long planId;

    /**
     * AI 省钱建议（多条用换行分隔）
     */
    private String advice;

    /**
     * 行程结束消费复盘报告
     */
    private String report;
}
