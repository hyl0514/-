package org.example.traveljavaserver.vo;

import lombok.Data;

import java.util.List;

/**
 * 多路线方案返回结构
 */
@Data
public class MultiRouteVO {

    /**
     * 候选路线方案列表（2-3 套，风格各不相同）
     */
    private List<RouteOption> routeList;

    /**
     * 单套路线方案
     */
    @Data
    public static class RouteOption {
        /**
         * 落库后的行程 id
         */
        private Long tripId;

        /**
         * 路线名称
         */
        private String routeName;

        /**
         * 一句话亮点总结
         */
        private String summary;

        /**
         * 风格标签，如：经典打卡 / 深度美食 / 小众秘境
         */
        private List<String> tags;

        /**
         * 预估总费用（人均，元）
         */
        private Integer estimatedCost;

        /**
         * 每日安排
         */
        private List<DayPlan> dayPlans;
    }

    /**
     * 每日安排
     */
    @Data
    public static class DayPlan {
        /**
         * 第几天
         */
        private Integer dayNo;

        /**
         * 当日主题
         */
        private String dayTitle;

        /**
         * 当日点位列表
         */
        private List<RoutePoint> points;
    }

    /**
     * 路线点位
     */
    @Data
    public static class RoutePoint {
        /**
         * 点位名称
         */
        private String name;

        /**
         * 点位类型：景点 / 美食 / 酒店 / 交通 / 购物 / 娱乐
         */
        private String pointType;

        /**
         * 建议时段：上午 / 下午 / 晚上
         */
        private String timeSlot;

        /**
         * 该点位人均预估花费（元）
         */
        private Integer estCost;

        /**
         * 简短说明
         */
        private String note;
    }
}
