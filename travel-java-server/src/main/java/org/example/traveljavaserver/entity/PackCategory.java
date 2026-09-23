package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 行李分类 pack_categories
 */
@Data
@TableName("pack_categories")
public class PackCategory implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long packId;

    private String categoryName;

    private Integer sortOrder;

    @TableField(exist = false)
    private List<PackItem> items;
}
