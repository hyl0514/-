package org.example.traveljavaserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.dto.PackCreateDTO;
import org.example.traveljavaserver.entity.Pack;
import org.example.traveljavaserver.entity.PackCategory;
import org.example.traveljavaserver.entity.PackItem;
import org.example.traveljavaserver.mapper.PackCategoryMapper;
import org.example.traveljavaserver.mapper.PackItemMapper;
import org.example.traveljavaserver.mapper.PackMapper;
import org.example.traveljavaserver.vo.Result;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 行李包 —— 需 JWT
 */
@RestController
@RequestMapping("/api/packs")
public class PackController {

    private final PackMapper packMapper;
    private final PackCategoryMapper categoryMapper;
    private final PackItemMapper itemMapper;

    public PackController(PackMapper packMapper,
                          PackCategoryMapper categoryMapper,
                          PackItemMapper itemMapper) {
        this.packMapper = packMapper;
        this.categoryMapper = categoryMapper;
        this.itemMapper = itemMapper;
    }

    @GetMapping
    public Result<List<Pack>> list(@CurrentUser LoginUser me) {
        List<Pack> packs = packMapper.selectList(
                new LambdaQueryWrapper<Pack>().eq(Pack::getUserId, me.userId())
                        .orderByDesc(Pack::getCreatedAt)
        );
        for (Pack p : packs) fillNested(p);
        return Result.ok(packs);
    }

    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public Result<Pack> create(@CurrentUser LoginUser me,
                               @RequestBody PackCreateDTO dto) {
        Pack pack = new Pack();
        pack.setUserId(me.userId());
        pack.setName(dto.getName());
        pack.setNote(dto.getNote());
        pack.setSavedAt(LocalDateTime.now());
        pack.setCreatedAt(LocalDateTime.now());
        packMapper.insert(pack);

        if (dto.getCategoryList() != null) {
            for (PackCreateDTO.CategoryItem c : dto.getCategoryList()) {
                PackCategory cat = new PackCategory();
                cat.setPackId(pack.getId());
                cat.setCategoryName(c.getCategoryName());
                cat.setSortOrder(c.getSortOrder());
                categoryMapper.insert(cat);

                if (c.getItems() != null) {
                    for (PackCreateDTO.PackItemDTO i : c.getItems()) {
                        PackItem item = new PackItem();
                        item.setCategoryId(cat.getId());
                        item.setItemName(i.getItemName());
                        item.setQuantity(i.getQuantity());
                        item.setCheckedDefault(i.getCheckedDefault());
                        item.setRemark(i.getRemark());
                        itemMapper.insert(item);
                    }
                }
            }
        }

        fillNested(pack);
        return Result.ok(pack);
    }

    @DeleteMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public Result<Object> delete(@CurrentUser LoginUser me, @PathVariable Long id) {
        Pack pack = packMapper.selectOne(
                new LambdaQueryWrapper<Pack>().eq(Pack::getId, id).eq(Pack::getUserId, me.userId())
        );
        if (pack == null) return Result.fail(404, "行李包不存在");

        List<PackCategory> cats = categoryMapper.selectList(
                new LambdaQueryWrapper<PackCategory>().eq(PackCategory::getPackId, id)
        );
        for (PackCategory c : cats) {
            itemMapper.delete(new LambdaQueryWrapper<PackItem>().eq(PackItem::getCategoryId, c.getId()));
        }
        categoryMapper.delete(new LambdaQueryWrapper<PackCategory>().eq(PackCategory::getPackId, id));
        packMapper.deleteById(id);
        return Result.ok();
    }

    private void fillNested(Pack pack) {
        List<PackCategory> cats = categoryMapper.selectList(
                new LambdaQueryWrapper<PackCategory>().eq(PackCategory::getPackId, pack.getId())
                        .orderByAsc(PackCategory::getSortOrder)
        );
        for (PackCategory c : cats) {
            c.setItems(itemMapper.selectList(
                    new LambdaQueryWrapper<PackItem>().eq(PackItem::getCategoryId, c.getId())
            ));
        }
        pack.setCategoryList(cats);
    }
}
