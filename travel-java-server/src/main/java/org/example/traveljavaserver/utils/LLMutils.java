package org.example.traveljavaserver.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

public class LLMutils {
    private String apiKey;
    private String baseUrl;
    private String model;
    private OkHttpClient client;
    private ObjectMapper objectMapper = new ObjectMapper();

    public LLMutils(String apiKey, String baseUrl, String model) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
        this.client = new OkHttpClient.Builder()
                .connectTimeout(60, TimeUnit.SECONDS)
                .readTimeout(120, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();
    }

    // 旅游推荐接口 - 非流式
    public String chat(String systemPrompt, String userPrompt) {
        String requestBody = buildRequestBody(systemPrompt, userPrompt, false);
        Request request = new Request.Builder()
                .url(baseUrl + "/chat/completions")
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + apiKey)
                .post(RequestBody.create(requestBody, MediaType.parse("application/json; charset=utf-8")))
                .build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("LLM调用异常：" + response.code());
            }
            String responseBody = response.body().string();
            return extractContent(responseBody);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // 模型返回数据处理
    private String extractContent(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode choices = root.path("choices");
        if (choices.isArray() && choices.size() > 0) {
            return choices.get(0).path("message").path("content").asText();
        }
        return "";
    }

    // 使用ObjectMapper构建请求体，避免字符串拼接的安全问题
    public String buildRequestBody(String systemPrompt, String userPrompt, Boolean stream) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            root.put("model", model);
            root.put("stream", stream);
            root.put("temperature", 0.7);
            
            ArrayNode messages = root.putArray("messages");
            
            if (systemPrompt != null && !systemPrompt.isEmpty()) {
                ObjectNode systemNode = objectMapper.createObjectNode();
                systemNode.put("role", "system");
                systemNode.put("content", systemPrompt);
                messages.add(systemNode);
            }
            
            ObjectNode userNode = objectMapper.createObjectNode();
            userNode.put("role", "user");
            userNode.put("content", userPrompt);
            messages.add(userNode);
            
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new RuntimeException("构建请求体失败", e);
        }
    }

    // 流式聊天接口，支持手动中断取消
    public String chatStream(String systemPrompt, String userPrompt, Consumer<String> callback, Runnable onCancel) throws IOException {
        String requestBody = buildRequestBody(systemPrompt, userPrompt, true);
        
        Request request = new Request.Builder()
                .url(baseUrl + "/chat/completions")
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Accept", "text/event-stream")
                .post(RequestBody.create(requestBody, MediaType.parse("application/json; charset=utf-8")))
                .build();
        
        StringBuilder fullContent = new StringBuilder();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("LLM调用异常：" + response.code());
            }
            try(BufferedReader reader = new BufferedReader(new InputStreamReader(response.body().byteStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // 检查是否被取消
                    if (Thread.currentThread().isInterrupted()) {
                        if (onCancel != null) {
                            onCancel.run();
                        }
                        break;
                    }
                    
                    if (line.startsWith("data: ")) {
                        String data = line.substring(6);
                        if ("[DONE]".equals(data)) {
                            break;
                        }
                        String content = parseStreamContent(data);
                        if (content != null && !content.isEmpty()) {
                            fullContent.append(content);
                            if (callback != null) {
                                callback.accept(content);
                            }
                        }
                    }
                }
            }
        } catch (IOException e) {
            // 如果是线程中断导致的异常，不抛出
            if (!Thread.currentThread().isInterrupted()) {
                throw e;
            }
        }
        return fullContent.toString();
    }

    // 大模型返回对话流数据处理函数
    private String parseStreamContent(String data) {
        try {
            JsonNode root = objectMapper.readTree(data);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode delta = choices.get(0).path("delta");
                return delta.path("content").asText("");
            }
        } catch (Exception e) {
            // 静默处理解析错误
        }
        return null;
    }
}
