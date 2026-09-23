package org.example.traveljavaserver.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.example.traveljavaserver.utils.LLMutils;
import org.example.traveljavaserver.vo.StreamChunkVO;
import org.example.traveljavaserver.vo.StreamDoneVO;
import org.example.traveljavaserver.vo.StreamErrorVO;
import org.springframework.beans.factory.annotation.Value;
import org.example.traveljavaserver.vo.TravelRecommendVO;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;


@Service
public class TravelService {
    @Value("${llm.api-key}")
    private String apiKey;
    @Value("${llm.base-url}")
    private String baseUrl;
    @Value("${llm.model}")
    private String model;

    private LLMutils llmUtils;
    private ObjectMapper objectMapper = new ObjectMapper();
    
    // 使用固定大小的线程池，避免并发请求过多
    private ExecutorService executorService = Executors.newFixedThreadPool(2);

    @PostConstruct
    public void init() {
        this.llmUtils = new LLMutils(apiKey, baseUrl, model);
    }


    public TravelRecommendVO recommend(String city, Integer days, Double budget) {
        TravelRecommendVO result = new TravelRecommendVO();
        
        // 参数校验，避免无效调用
        if (city == null || city.trim().isEmpty()) {
            result.setSuccess(false);
            result.setError("目的地不能为空");
            return result;
        }
        if (days == null || days < 1 || days > 30) {
            result.setSuccess(false);
            result.setError("天数必须在1-30天之间");
            return result;
        }
        if (budget == null || budget < 100) {
            result.setSuccess(false);
            result.setError("预算不能低于100元");
            return result;
        }
        
        String prompt = buildTravelPrompt(city, budget, days);
        try {
            String response = llmUtils.chat(null, prompt);
            return parseTravelResponse(response);
        } catch (Exception e) {
            result.setSuccess(false);
            result.setError("旅游推荐失败: " + e.getMessage());
            return result;
        }
    }

    // service旅游推荐返回数据处理
    private TravelRecommendVO parseTravelResponse(String response) {
        TravelRecommendVO result = new TravelRecommendVO();

        try {
            String jsonContent = extractJson(response);
            if (jsonContent != null) {
                result = objectMapper.readValue(jsonContent, TravelRecommendVO.class);
            } else {
                result.setSuccess(false);
                result.setError("未能从响应中提取JSON");
                result.setRawResponse(response);
            }
        } catch (Exception e) {
            result.setSuccess(false);
            result.setError("JSON解析失败");
            result.setRawResponse(response);
        }

        return result;
    }

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

    // 优化prompt，减少token消耗，明确要求简洁输出
    private String buildTravelPrompt(String city, Double budget, Integer days) {
        return "你是一个专业的旅游规划师。\n\n" +
                "为用户生成一份" + city + "的" + days + "天旅游规划，预算" + budget + "元。\n\n" +
                "要求：\n" +
                "1. 行程合理，覆盖主要景点\n" +
                "2. 预算分配合理\n" +
                "3. 输出格式为纯JSON，不要包含任何markdown格式（如```json）\n\n" +
                "JSON结构：\n" +
                "{\n" +
                "  \"success\": true,\n" +
                "  \"city\": \"" + city + "\",\n" +
                "  \"days\": " + days + ",\n" +
                "  \"totalBudget\": " + budget + ",\n" +
                "  \"dailyItinerary\": [{\n" +
                "    \"day\": 1,\n" +
                "    \"date\": \"第1天\",\n" +
                "    \"morning\": {\"spot\":\"景点\",\"duration\":\"时长\",\"ticket\":\"门票\",\"transportation\":\"交通\",\"description\":\"介绍\"},\n" +
                "    \"afternoon\": {\"spot\":\"景点\",\"duration\":\"时长\",\"ticket\":\"门票\",\"transportation\":\"交通\",\"description\":\"介绍\"},\n" +
                "    \"evening\": {\"spot\":\"活动\",\"duration\":\"时长\",\"ticket\":\"费用\",\"transportation\":\"交通\",\"description\":\"介绍\"}\n" +
                "  }],\n" +
                "  \"budgetBreakdown\": {\"accommodation\":0,\"food\":0,\"transportation\":0,\"tickets\":0,\"other\":0},\n" +
                "  \"tips\": [\"提示\"],\n" +
                "  \"warnings\": [\"注意\"]\n" +
                "}";
    }

    public SseEmitter chat(String message) {
        // 设置超时时间为3分钟
        SseEmitter emitter = new SseEmitter(180000L);
        
        // 消息长度限制，避免过长的消息浪费token
        if (message == null || message.trim().isEmpty()) {
            try {
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(StreamErrorVO.of("消息不能为空"))));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }
        
        // 消息过长时截断，使用final变量以便在lambda中使用
        final String finalMessage;
        if (message.length() > 1000) {
            finalMessage = message.substring(0, 1000) + "...";
        } else {
            finalMessage = message;
        }

        executorService.execute(() -> {
            try {
                String systemPrompt = "你是一个友好的旅游助手,请用中文简洁回答用户关于旅游的问题。回答不要超过300字。";

                Consumer<String> callback = content -> {
                    try {
                       String json = objectMapper.writeValueAsString(StreamChunkVO.of(content));
                       emitter.send(SseEmitter.event().data(json));
                    } catch (Exception e) {
                        // 客户端断开连接时静默处理
                        Thread.currentThread().interrupt();
                    }
                };
                
                Runnable onCancel = () -> {
                    // 请求被取消时的清理逻辑
                };
                
                llmUtils.chatStream(systemPrompt, finalMessage, callback, onCancel);
                
                String doneJson = objectMapper.writeValueAsString(StreamDoneVO.of());
                emitter.send(SseEmitter.event().data(doneJson));
                emitter.complete();
            }
            catch (Exception e) {
                // 如果是线程中断，说明请求被取消，不需要发送错误
                if (!Thread.currentThread().isInterrupted()) {
                    try {
                        String errorJson = objectMapper.writeValueAsString(StreamErrorVO.of(e.getMessage()));
                        emitter.send(SseEmitter.event().data(errorJson));
                    } catch (Exception e1) {
                        // 静默处理
                    }
                }
                emitter.completeWithError(e);
            }
        });
        
        // 设置客户端断开连接时的回调
        emitter.onCompletion(() -> {
            // 客户端断开，取消请求
            executorService.shutdownNow();
            try {
                executorService.awaitTermination(1, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            // 重新创建线程池
            executorService = Executors.newFixedThreadPool(2);
        });
        
        emitter.onTimeout(() -> {
            emitter.completeWithError(new RuntimeException("请求超时"));
        });
        
        return emitter;
    }
}
