package org.example.traveljavaserver.vo;

import lombok.Data;

import java.util.List;

/**
 * AI 行李打包清单返回结构
 * 顶层为 categoryList 分类数组，每个分类下包含物品列表
 */
@Data
public class PackingListVO {

    /**
     * 落库后的行李包 id
     */
    private Long packId;

    /**
     * 分类列表（证件类、衣物类、药品类、电子设备类、洗漱护肤类、随身杂物类等）
     */
    private List<Category> categoryList;

    /**
     * 物品分类
     */
    @Data
    public static class Category {
        /**
         * 分类名称
         */
        private String categoryName;

        /**
         * 该分类下的物品列表
         */
        private List<Item> itemList;
    }

    /**
     * 打包物品条目
     */
    @Data
    public static class Item {
        /**
         * 物品名称
         */
        private String itemName;

        /**
         * 推荐携带数量（根据出行天数动态计算）
         */
        private Integer quantity;

        /**
         * 是否默认勾选：true=刚需物品，false=可选物品
         */
        private Boolean checkedDefault;

        /**
         * 备注：结合目的地天气说明适用场景
         */
        private String remark;
    }
}
