package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 用户表 users
 */
@Data
@TableName("users")
public class User implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    /** 加密后的密码 */
    private String password;

    /** admin / user */
    private String role;

    private String name;

    private String avatar;

    private String sign;

    private String origin;

    /** 预算范围，JSON 字符串 */
    private String budget;

    /** 兴趣，JSON 字符串 */
    private String interests;

    /** normal / disabled */
    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /** 嵌套：用户发起的行程（非 DB 字段） */
    @TableField(exist = false)
    private java.util.List<Trip> trips;
}
