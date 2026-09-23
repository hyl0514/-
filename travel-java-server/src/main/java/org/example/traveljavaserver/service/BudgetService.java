package org.example.traveljavaserver.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.example.traveljavaserver.dto.BudgetAdviceDTO;
import org.example.traveljavaserver.utils.JsonExtractUtil;
import org.example.traveljavaserver.utils.LLMutils;
import org.example.traveljavaserver.vo.BudgetAdviceVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 预算智能分析服务
 * 行中：预算临近上限时给出省钱建议；行程结束：一键生成消费复盘报告
 */
@Service
public class BudgetService {

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
     * 生成省钱建议
     */
    public BudgetAdviceVO savingAdvice(BudgetAdviceDTO dto) {
        String systemPrompt = "你是理性旅行消费顾问。根据用户的预算与账单情况，给出3-5条具体、可执行的省钱建议。\n" +
                "【规则】\n" +
                "1. 建议必须针对账单中真实的高花费类别，不要泛泛而谈；\n" +
                "2. 可包含住宿替代、错峰用餐、交通组合、免费景点替换等方向；\n" +
                "3. 每条建议一行，以序号开头，语言简洁，总行数不超过5行。\n" +
                "【输出格式】只输出纯JSON：{\"advice\": \"1. 第一条建议\\n2. 第二条建议\"}";

        String response = llmUtils.chat(systemPrompt, buildUserPrompt(dto));
        return parseAdvice(response);
    }

    /**
     * 生成行程消费复盘报告
     */
    public BudgetAdviceVO reviewReport(BudgetAdviceDTO dto) {
        String systemPrompt = "你是旅行消费复盘分析师。根据用户整段行程的预算与账单，生成结构化消费复盘报告。\n" +
                "【规则】\n" +
                "1. 报告包含：总体执行情况（实际vs预算）、消费结构分析（各分类占比）、超支或节省亮点、下次出行改进建议；\n" +
                "2. 内容基于账单数据，数字尽量与账单吻合；\n" +
                "3. 用换行分段，避免markdown符号，总字数300字以内。\n" +
                "【输出格式】只输出纯JSON：{\"report\": \"报告正文，用换行分段\"}";

        String response = llMUtilsChat(systemPrompt, dto);
        return parseReport(response);
    }

    private String llMUtilsChat(String systemPrompt, BudgetAdviceDTO dto) {
        return llmUtils.chat(systemPrompt, buildUserPrompt(dto));
    }

    private String buildUserPrompt(BudgetAdviceDTO dto) {
        StringBuilder billsText = new StringBuilder();
        if (dto.getBills() != null) {
            for (BudgetAdviceDTO.BillItem bill : dto.getBills()) {
                billsText.append("    - ").append(bill.getCategory())
                        .append("｜").append(bill.getPurpose())
                        .append("｜").append(bill.getAmount()).append("元\n");
            }
        }
        return "请分析以下出行消费数据：\n" +
                "{\n" +
                "  \"destination\": \"" + safe(dto.getDestination()) + "\",\n" +
                "  \"totalBudget\": " + dto.getTotalBudget() + ",\n" +
                "  \"estimatedCost\": " + valueOrZero(dto.getEstimatedCost()) + ",\n" +
                "  \"actualCost\": " + valueOrZero(dto.getActualCost()) + ",\n" +
                "  \"bills\": [\n" + billsText + "  ]\n" +
                "}";
    }

    private BudgetAdviceVO parseAdvice(String response) {
        BudgetAdviceVO vo = parse(response);
        if (vo.getAdvice() == null || vo.getAdvice().isEmpty()) {
            throw new IllegalStateException("AI未返回省钱建议");
        }
        return vo;
    }

    private BudgetAdviceVO parseReport(String response) {
        BudgetAdviceVO vo = parse(response);
        if (vo.getReport() == null || vo.getReport().isEmpty()) {
            throw new IllegalStateException("AI未返回复盘报告");
        }
        return vo;
    }

    private BudgetAdviceVO parse(String response) {
        String json = JsonExtractUtil.extract(response);
        if (json == null) {
            throw new IllegalStateException("未能从AI响应中提取分析JSON");
        }
        try {
            return objectMapper.readValue(json, BudgetAdviceVO.class);
        } catch (Exception e) {
            throw new IllegalStateException("分析JSON解析失败: " + e.getMessage());
        }
    }

    private String safe(String text) {
        return text == null ? "" : text.replace("\"", "'");
    }

    private Integer valueOrZero(Integer value) {
        return value == null ? 0 : value;
    }
}
