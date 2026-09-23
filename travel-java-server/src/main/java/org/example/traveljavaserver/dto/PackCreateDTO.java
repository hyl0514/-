package org.example.traveljavaserver.dto;

import lombok.Data;

import java.util.List;

/**
 * 新增行李包（含 categoryList 嵌套）
 */
@Data
public class PackCreateDTO {
    private Long id;
    private String name;
    private String note;

    @Data
    public static class CategoryItem {
        private Long id;
        private String categoryName;
        private Integer sortOrder;
        private List<PackItemDTO> items;
    }

    @Data
    public static class PackItemDTO {
        private Long id;
        private String itemName;
        private Integer quantity;
        private Integer checkedDefault;
        private String remark;
    }

    private List<CategoryItem> categoryList;
}
