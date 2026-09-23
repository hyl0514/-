package org.example.traveljavaserver.dto;

import lombok.Data;

/**
 * 用户基本信息（不含敏感字段 password）
 */
@Data
public class UserProfileVO {
    private Long id;
    private String username;
    private String role;
    private String name;
    private String avatar;
    private String sign;
    private String origin;
    private String budget;
    private String interests;
    private String status;
    private String createdAt;
    private String updatedAt;
}
