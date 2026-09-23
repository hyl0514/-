package org.example.traveljavaserver.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 账单 expense_bills
 */
@Data
@TableName("expense_bills")
public class ExpenseBill implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long tripId;

    private Long planId;

    private String source;

    private String category;

    private String purpose;

    private BigDecimal amount;

    private BigDecimal actual;

    private Integer dayNo;

    private LocalDate billDate;

    private Long poiId;

    private LocalDateTime createdAt;
}
