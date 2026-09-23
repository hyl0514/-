package org.example.traveljavaserver.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.example.traveljavaserver.utils.JsonExtractUtil;
import org.example.traveljavaserver.utils.LLMutils;
import org.example.traveljavaserver.vo.PackingCheckVO;
import org.example.traveljavaserver.vo.PackingListVO;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * AI 行李打包清单服务
 * 根据目的地、出行天数、天气信息、出行类型生成结构化打包清单
 */
@Service
public class PackingService {

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
     * 生成行李打包清单
     *
     * @param destination 目的地
     * @param travelDays  出行总天数
     * @param weatherInfo 7天天气信息，可为空（为空时走通用推荐降级逻辑）
     * @param tripType    出行类型：旅游 / 出差
     * @return 结构化打包清单
     */
    public PackingListVO generate(String destination, Integer travelDays, String weatherInfo, String tripType) {
        // 出行类型为空时默认旅游
        String finalTripType = (tripType == null || tripType.trim().isEmpty()) ? "旅游" : tripType.trim();
        String finalWeatherInfo = (weatherInfo == null || weatherInfo.trim().isEmpty())
                ? "未提供天气信息" : weatherInfo.trim();

        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(destination, travelDays, finalWeatherInfo, finalTripType);

        String response = llmUtils.chat(systemPrompt, userPrompt);

        return parsePackingResponse(response);
    }

    /**
     * AI 检测清单中可能遗漏的物品
     *
     * @param destination 目的地
     * @param travelDays  出行总天数
     * @param weatherInfo 天气信息，可为空
     * @param tripType    出行类型
     * @param itemNames   用户当前已包含的物品名称
     * @return 遗漏物品列表与总体结论
     */
    public PackingCheckVO checkMissing(String destination, Integer travelDays, String weatherInfo,
                                       String tripType, List<String> itemNames) {
        String finalTripType = (tripType == null || tripType.trim().isEmpty()) ? "旅游" : tripType.trim();
        String finalWeatherInfo = (weatherInfo == null || weatherInfo.trim().isEmpty())
                ? "未提供天气信息" : weatherInfo.trim();
        String itemsText = (itemNames == null || itemNames.isEmpty())
                ? "清单为空" : String.join("、", itemNames);

        String systemPrompt = "你是严谨的出行打包审核助手。对照用户当前已准备的物品清单，结合目的地、天数与天气，找出可能遗漏的重要物品。\n" +
                "【规则】\n" +
                "1. 只报告确实未在清单中出现、且对本次出行重要的物品，不要重复清单已有物品；\n" +
                "2. 优先关注证件、刚需药品、天气适配物品（防晒/雨具/保暖）、充电设备；\n" +
                "3. missingList 控制在3-8条，reason 说明为什么需要它；\n" +
                "4. 若清单已很完整，missingList 返回空数组，summary 给予肯定结论。\n" +
                "【输出格式】只输出纯JSON：\n" +
                "{\"summary\": \"总体结论\", \"missingList\": [{\"itemName\": \"物品名称\", \"reason\": \"遗漏原因\"}]}";

        String userPrompt = "请检测以下清单是否有遗漏：\n" +
                "{\n" +
                "  \"destination\": \"" + destination + "\",\n" +
                "  \"travelDays\": " + travelDays + ",\n" +
                "  \"weatherInfo\": \"" + finalWeatherInfo.replace("\"", "'") + "\",\n" +
                "  \"tripType\": \"" + finalTripType + "\",\n" +
                "  \"packedItems\": \"" + itemsText.replace("\"", "'") + "\"\n" +
                "}";

        String response = llmUtils.chat(systemPrompt, userPrompt);
        String json = JsonExtractUtil.extract(response);
        if (json == null) {
            throw new IllegalStateException("未能从AI响应中提取检测JSON");
        }
        try {
            return objectMapper.readValue(json, PackingCheckVO.class);
        } catch (Exception e) {
            throw new IllegalStateException("检测JSON解析失败: " + e.getMessage());
        }
    }

    /**
     * 系统提示词：固化专业出行打包助手的全部硬性规则
     */
    private String buildSystemPrompt() {
        return "你是专业出行打包助手，根据用户提供的行程信息，生成结构化行李打包清单。\n" +
                "【硬性规则】\n" +
                "1. 物品总数：至少50条物品条目。固定基础分类：证件类、衣物类、药品类、电子设备类；可根据出行场景自动扩展洗漱护肤类、随身杂物类，保证条目充足。\n" +
                "2. 每条物品固定字段：\n" +
                "itemName：物品名称\n" +
                "quantity：推荐携带数量（数字，根据出行天数自动计算；例如袜子=出行天数+1）\n" +
                "checkedDefault：布尔值 true/false；true=刚需物品默认勾选；false=可选物品默认不勾选\n" +
                "remark：简短备注，结合目的地天气说明适用场景（高温/雨天/紫外线强等）\n" +
                "3. 生成逻辑：\n" +
                "① 高温天气：增加防晒、凉感衣物；低温天气：增加保暖外套、暖宝宝；\n" +
                "② 有降雨：增加雨伞、雨衣、防水收纳袋；\n" +
                "③ 紫外线高：增加墨镜、防晒帽、高倍防晒霜；\n" +
                "④ 出差场景优先商务衣物、名片、办公配件；旅游场景侧重便携休闲用品；\n" +
                "⑤ 核心刚需物品checkedDefault=true；非必需可选物品checkedDefault=false；\n" +
                "⑥ 物品数量跟随出行天数动态变化。\n" +
                "4. 降级逻辑：如果缺少天气信息，则生成通用出行清单，备注统一标注「无天气信息，通用推荐」。\n" +
                "【输出格式强制约束】\n" +
                "只输出纯JSON，不要任何前言、解释、markdown。\n" +
                "顶层key：categoryList，数组；每个分类对象包含 categoryName（分类名称）、itemList（物品数组）。\n" +
                "JSON结构：\n" +
                "{\n" +
                "  \"categoryList\": [\n" +
                "    {\n" +
                "      \"categoryName\": \"证件类\",\n" +
                "      \"itemList\": [\n" +
                "        {\n" +
                "          \"itemName\": \"身份证\",\n" +
                "          \"quantity\": 1,\n" +
                "          \"checkedDefault\": true,\n" +
                "          \"remark\": \"国内出行必备\"\n" +
                "        }\n" +
                "      ]\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }

    /**
     * 用户提示词：以结构化 JSON 传入行程变量
     */
    private String buildUserPrompt(String destination, Integer travelDays, String weatherInfo, String tripType) {
        return "请根据以下行程信息生成行李打包清单：\n" +
                "{\n" +
                "  \"destination\": \"" + destination + "\",\n" +
                "  \"travelDays\": " + travelDays + ",\n" +
                "  \"weatherInfo\": \"" + weatherInfo.replace("\"", "'") + "\",\n" +
                "  \"tripType\": \"" + tripType + "\"\n" +
                "}";
    }

    /**
     * 解析大模型返回的清单 JSON，兼容 markdown 代码块包裹
     */
    private PackingListVO parsePackingResponse(String response) {
        String jsonContent = extractJson(response);
        if (jsonContent == null) {
            throw new IllegalStateException("未能从AI响应中提取清单JSON");
        }
        try {
            PackingListVO vo = objectMapper.readValue(jsonContent, PackingListVO.class);
            if (vo.getCategoryList() == null || vo.getCategoryList().isEmpty()) {
                throw new IllegalStateException("AI返回的清单内容为空");
            }
            return vo;
        } catch (Exception e) {
            throw new IllegalStateException("清单JSON解析失败: " + e.getMessage());
        }
    }

    /**
     * 从响应中提取 JSON：优先提取 ```json 代码块，其次提取首尾花括号之间的内容
     */
    private String extractJson(String response) {
        if (response == null || response.isEmpty()) {
            return null;
        }

        String[] patterns = {
                "```json\\n([\\s\\S]*?)\\n```",
                "```\\n([\\s\\S]*?)\\n```"
        };

        for (String pattern : patterns) {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(response);
            if (m.find()) {
                return m.group(1);
            }
        }

        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return response.substring(start, end + 1);
        }

        return null;
    }
}
