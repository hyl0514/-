package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * 行李物品 pack_items
 */
@Data
@TableName("pack_items")
public class PackItem implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long categoryId;

    private String itemName;

    private Integer quantity;

    /** 0/1 默认是否勾选 */
    private Integer checkedDefault;

    private String remark;
}
