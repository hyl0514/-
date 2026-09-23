package org.example.traveljavaserver.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 大模型 JSON 响应提取工具
 * 兼容模型返回 markdown 代码块包裹或夹带说明文字的情况
 */
public final class JsonExtractUtil {

    private JsonExtractUtil() {
    }

    private static final Pattern CODE_BLOCK = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```");

    /**
     * 从模型响应中提取纯 JSON 文本
     *
     * @param response 模型原始响应
     * @return JSON 文本；无法提取时返回 null
     */
    public static String extract(String response) {
        if (response == null || response.isEmpty()) {
            return null;
        }

        Matcher matcher = CODE_BLOCK.matcher(response);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return response.substring(start, end + 1);
        }

        return null;
    }
}
