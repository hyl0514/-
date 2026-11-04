package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AI 沿途场所推荐缓存 poi_cache
 */
@Data
@TableName("poi_cache")
public class PoiCache implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String destination;

    private String routeContext;

    /** 推荐结果 JSON 字符串 */
    private String payload;

    private LocalDateTime createdAt;
}
