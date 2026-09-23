package org.example.traveljavaserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.entity.Favorite;
import org.example.traveljavaserver.mapper.FavoriteMapper;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 收藏管理 —— 需 JWT
 */
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteMapper favoriteMapper;

    public FavoriteController(FavoriteMapper favoriteMapper) {
        this.favoriteMapper = favoriteMapper;
    }

    @GetMapping
    public Result<List<Favorite>> list(@CurrentUser LoginUser me,
                                       @RequestParam(required = false) String type) {
        LambdaQueryWrapper<Favorite> q = new LambdaQueryWrapper<>();
        q.eq(Favorite::getUserId, me.userId());
        if (type != null && !type.isBlank()) q.eq(Favorite::getFavType, type);
        q.orderByDesc(Favorite::getSavedAt);
        return Result.ok(favoriteMapper.selectList(q));
    }

    @PostMapping
    public Result<Favorite> create(@CurrentUser LoginUser me,
                                  @RequestBody Favorite fav) {
        fav.setId(null);
        fav.setUserId(me.userId());
        fav.setSavedAt(LocalDateTime.now());

        // 去重检查
        Long dup = favoriteMapper.selectCount(new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getUserId, me.userId())
                .eq(Favorite::getFavType, fav.getFavType())
                .eq(Favorite::getTargetId, fav.getTargetId()));
        if (dup != null && dup > 0) {
            return Result.fail(400, "已收藏过");
        }
        favoriteMapper.insert(fav);
        return Result.ok(fav);
    }

    @DeleteMapping("/{id}")
    public Result<Object> delete(@CurrentUser LoginUser me, @PathVariable Long id) {
        Favorite fav = favoriteMapper.selectById(id);
        if (fav == null) return Result.fail(404, "收藏不存在");
        if (!fav.getUserId().equals(me.userId())) return Result.fail(403, "无权操作");
        favoriteMapper.deleteById(id);
        return Result.ok();
    }

    @GetMapping("/check")
    public Result<Boolean> check(@CurrentUser LoginUser me,
                                 @RequestParam String type,
                                 @RequestParam Long targetId) {
        Long cnt = favoriteMapper.selectCount(new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getUserId, me.userId())
                .eq(Favorite::getFavType, type)
                .eq(Favorite::getTargetId, targetId));
        return Result.ok(cnt != null && cnt > 0);
    }
}
