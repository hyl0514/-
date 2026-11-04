package org.example.traveljavaserver.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequestDTO {
    @NotBlank(message = "消息不能为空")
    private String message;

    /**
     * 会话标识，可空；为空时后端生成 UUID
     */
    private String sessionKey;

    /**
     * 会话标题，可空；为空时取首条消息前 20 字
     */
    private String sessionTitle;
}
