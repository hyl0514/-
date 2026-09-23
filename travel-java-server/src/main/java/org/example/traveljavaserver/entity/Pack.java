package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 行李包 packs
 */
@Data
@TableName("packs")
public class Pack implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String name;

    private String note;

    private LocalDateTime savedAt;

    private LocalDateTime createdAt;

    /** 嵌套：分类 */
    @TableField(exist = false)
    private List<PackCategory> categoryList;
}
