package org.example.traveljavaserver.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.example.traveljavaserver.utils.JsonExtractUtil;
import org.example.traveljavaserver.utils.LLMutils;
import org.example.traveljavaserver.vo.PoiRecommendVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 沿途场所推荐服务
 * 结合选中路线的每日点位，推荐酒店、景点、餐饮、娱乐四类周边场所
 */
@Service
public class PoiService {

    @Value("${llm.api-key}")
    private String apiKey;
    @Value("${llm.base-url}")
    private String baseUrl;
    @Value("${llm.model}")
    private String model;

    private LLMutils llmUtils;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        this.llmUtils = new LLMutils(apiKey, baseUrl, model);
    }

    /**
     * 推荐沿途场所
     */
    public PoiRecommendVO recommend(String destination, String routeContext) {
        String finalContext = (routeContext == null || routeContext.trim().isEmpty())
                ? "未提供路线点位" : routeContext.trim();

        String systemPrompt = buildSystemPrompt();
        String userPrompt = "请根据以下信息推荐沿途及周边场所：\n" +
                "{\n" +
                "  \"destination\": \"" + destination + "\",\n" +
                "  \"routeContext\": \"" + finalContext.replace("\"", "'") + "\"\n" +
                "}";

        String response = llmUtils.chat(systemPrompt, userPrompt);
        return parse(response);
    }

    private String buildSystemPrompt() {
        return "你是本地生活推荐专家，熟悉目的地城市的酒店、景点、餐饮与娱乐资源。\n" +
                "【任务】根据用户路线每日经过的点位，推荐位置顺路、口碑好的周边场所。\n" +
                "【硬性规则】\n" +
                "1. poiList 至少12条，必须覆盖酒店、景点、餐饮、娱乐四个类别，每类至少2条；\n" +
                "2. 优先推荐真实存在于目的地城市、且与路线点位相邻的场所；\n" +
                "3. distance 为距最近路线点位的距离字符串，如 0.8km；\n" +
                "4. rating 为4.0-5.0之间的数字，保留一位小数；\n" +
                "5. refPrice 为数字：酒店表示每晚参考价，景点表示门票价，餐饮与娱乐表示人均消费；\n" +
                "6. feature 用一句话概括特色，reason 说明与当前路线的关联，如“距第2天午餐点位步行8分钟”；\n" +
                "7. 酒店推荐可覆盖不同价位（经济型/舒适型/高档型）。\n" +
                "【输出格式强制约束】\n" +
                "只输出纯JSON，不要任何前言、解释、markdown。结构如下：\n" +
                "{\n" +
                "  \"poiList\": [\n" +
                "    {\"name\": \"场所名称\", \"category\": \"酒店\", \"distance\": \"0.6km\", \"rating\": 4.7, \"refPrice\": 420, \"feature\": \"一句话特色\", \"reason\": \"关联路线的理由\"}\n" +
                "  ]\n" +
                "}";
    }

    private PoiRecommendVO parse(String response) {
        String json = JsonExtractUtil.extract(response);
        if (json == null) {
            throw new IllegalStateException("未能从AI响应中提取场所JSON");
        }
        try {
            PoiRecommendVO vo = objectMapper.readValue(json, PoiRecommendVO.class);
            if (vo.getPoiList() == null || vo.getPoiList().isEmpty()) {
                throw new IllegalStateException("AI返回的场所列表为空");
            }
            return vo;
        } catch (Exception e) {
            throw new IllegalStateException("场所JSON解析失败: " + e.getMessage());
        }
    }
}
