package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 收藏 favorites
 */
@Data
@TableName("favorites")
public class Favorite implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /** spot / food / hotel / post ... */
    private String favType;

    private Long targetId;

    private String targetName;

    private String coverImg;

    private Double rating;

    private String priceText;

    private String tags;

    private String keywords;

    /** payload，JSON 字符串，保存详情快照 */
    private String payload;

    private LocalDateTime savedAt;
}
