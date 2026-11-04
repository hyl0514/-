package org.example.traveljavaserver.vo;

import lombok.Data;

@Data
public class StreamDoneVO {
    private Boolean done = true;

    /**
     * 当前会话标识
     */
    private String sessionKey;

    /**
     * 落库后的会话 id
     */
    private Long sessionId;

    public static StreamDoneVO of(String sessionKey, Long sessionId) {
        StreamDoneVO vo = new StreamDoneVO();
        vo.setSessionKey(sessionKey);
        vo.setSessionId(sessionId);
        return vo;
    }
}
