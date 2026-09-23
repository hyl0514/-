package org.example.traveljavaserver.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.example.traveljavaserver.utils.JsonExtractUtil;
import org.example.traveljavaserver.utils.LLMutils;
import org.example.traveljavaserver.vo.MultiRouteVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;



/**
 * 多路线 AI 规划服务
 * 一次生成 2-3 套风格不同的多日旅行路线，供用户比选
 */
@Service
public class RoutePlanService {

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
     * 生成多套路线方案
     */
    public MultiRouteVO generateRoutes(String origin, String destination, Integer travelDays, String preference) {
        String finalOrigin = (origin == null || origin.trim().isEmpty()) ? "未指定（异地出发）" : origin.trim();
        String finalPreference = (preference == null || preference.trim().isEmpty()) ? "休闲" : preference.trim();

        String systemPrompt = buildSystemPrompt();
        String userPrompt = "请根据以下信息生成路线方案：\n" +
                "{\n" +
                "  \"origin\": \"" + finalOrigin + "\",\n" +
                "  \"destination\": \"" + destination + "\",\n" +
                "  \"travelDays\": " + travelDays + ",\n" +
                "  \"preference\": \"" + finalPreference + "\"\n" +
                "}";

        String response = llmUtils.chat(systemPrompt, userPrompt);
        return parse(response);
    }

    private String buildSystemPrompt() {
        return "你是资深旅行路线规划师，擅长围绕目的地设计节奏合理、体验丰富的多日路线。\n" +
                "【任务】根据用户输入生成2-3套风格明显不同的路线方案（如经典全景线、深度美食线、小众秘境线），并在其中优先体现用户的出行偏好。\n" +
                "【硬性规则】\n" +
                "1. 每套方案每日安排3-5个点位，点位之间地理位置相邻，路线不走回头路；\n" +
                "2. pointType 只能取：景点、美食、酒店、交通、购物、娱乐；timeSlot 只能取：上午、下午、晚上；\n" +
                "3. estCost 为该点位人均预估花费数字（元），免费景点填0；\n" +
                "4. estimatedCost 为整套路线人均总预估花费，需与各点位花费及交通住宿大体吻合；\n" +
                "5. 每天的点位名称应真实存在于目的地城市，酒店只在第1天晚上的点位中出现一次即可；\n" +
                "6. 三套方案的点位集合、节奏、标签要有明显差异。\n" +
                "【输出格式强制约束】\n" +
                "只输出纯JSON，不要任何前言、解释、markdown。结构如下：\n" +
                "{\n" +
                "  \"routeList\": [\n" +
                "    {\n" +
                "      \"routeName\": \"方案名称\",\n" +
                "      \"summary\": \"一句话亮点\",\n" +
                "      \"tags\": [\"经典打卡\"],\n" +
                "      \"estimatedCost\": 3000,\n" +
                "      \"dayPlans\": [\n" +
                "        {\n" +
                "          \"dayNo\": 1,\n" +
                "          \"dayTitle\": \"当日主题\",\n" +
                "          \"points\": [\n" +
                "            {\"name\": \"点位名称\", \"pointType\": \"景点\", \"timeSlot\": \"上午\", \"estCost\": 60, \"note\": \"简短说明\"}\n" +
                "          ]\n" +
                "        }\n" +
                "      ]\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }

    private MultiRouteVO parse(String response) {
        String json = JsonExtractUtil.extract(response);
        if (json == null) {
            throw new IllegalStateException("未能从AI响应中提取路线JSON");
        }
        try {
            MultiRouteVO vo = objectMapper.readValue(json, MultiRouteVO.class);
            if (vo.getRouteList() == null || vo.getRouteList().isEmpty()) {
                throw new IllegalStateException("AI返回的路线方案为空");
            }
            return vo;
        } catch (Exception e) {
            throw new IllegalStateException("路线JSON解析失败: " + e.getMessage());
        }
    }
}
