package org.example.traveljavaserver.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteVO {
    private Long id;
    private String city;
    private Integer days;
    private Double totalBudget;
    private String description;
    private LocalDateTime createdAt;
}
