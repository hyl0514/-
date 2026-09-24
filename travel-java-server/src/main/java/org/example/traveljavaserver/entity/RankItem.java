package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 榜单条目（rank_items 表）
 */
@Data
@TableName("rank_items")
public class RankItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 城市 */
    private String city;

    /** hotel / food / spot */
    private String cat;

    /** red / black */
    private String color;

    /** 名次 */
    private Integer position;

    private String name;

    private BigDecimal rating;

    private String priceText;

    /** JSON 数组字符串 */
    private String tags;

    /** JSON 数组字符串 */
    private String kw;

    private String loc;

    private String img;

    private String imgKw;
}
