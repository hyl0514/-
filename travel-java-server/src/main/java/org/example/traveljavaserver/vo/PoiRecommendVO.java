package org.example.traveljavaserver.vo;

import lombok.Data;

import java.util.List;

/**
 * 沿途场所推荐返回结构
 */
@Data
public class PoiRecommendVO {

    /**
     * 落库后的缓存记录 id
     */
    private Long cacheId;

    /**
     * 推荐场所列表
     */
    private List<PoiItem> poiList;

    /**
     * 场所条目
     */
    @Data
    public static class PoiItem {
        /**
         * 场所名称
         */
        private String name;

        /**
         * 类别：酒店 / 景点 / 餐饮 / 娱乐
         */
        private String category;

        /**
         * 距路线点位距离，如 0.8km
         */
        private String distance;

        /**
         * 评分，4.0-5.0
         */
        private Double rating;

        /**
         * 参考价格（元）：酒店为每晚价，其余为人均价
         */
        private Integer refPrice;

        /**
         * 一句话特色
         */
        private String feature;

        /**
         * 与当前路线的关联理由
         */
        private String reason;
    }
}
