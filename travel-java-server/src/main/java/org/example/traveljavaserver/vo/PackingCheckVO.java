package org.example.traveljavaserver.vo;

import lombok.Data;

import java.util.List;

/**
 * AI 行李缺失检测返回结构
 */
@Data
public class PackingCheckVO {

    /**
     * 总体检测结论
     */
    private String summary;

    /**
     * 可能遗漏的物品列表
     */
    private List<MissingItem> missingList;

    /**
     * 遗漏物品
     */
    @Data
    public static class MissingItem {
        /**
         * 物品名称
         */
        private String itemName;

        /**
         * 遗漏原因/适用场景
         */
        private String reason;
    }
}
