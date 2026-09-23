package org.example.traveljavaserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.entity.AuditLog;
import org.example.traveljavaserver.entity.CommunityPost;
import org.example.traveljavaserver.entity.Favorite;
import org.example.traveljavaserver.entity.PostComment;
import org.example.traveljavaserver.mapper.AuditLogMapper;
import org.example.traveljavaserver.mapper.CommunityPostMapper;
import org.example.traveljavaserver.mapper.FavoriteMapper;
import org.example.traveljavaserver.mapper.PostCommentMapper;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 社区帖子 —— 需 JWT
 */
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final CommunityPostMapper postMapper;
    private final PostCommentMapper commentMapper;
    private final FavoriteMapper favoriteMapper;
    private final AuditLogMapper auditLogMapper;

    public PostController(CommunityPostMapper postMapper,
                          PostCommentMapper commentMapper,
                          FavoriteMapper favoriteMapper,
                          AuditLogMapper auditLogMapper) {
        this.postMapper = postMapper;
        this.commentMapper = commentMapper;
        this.favoriteMapper = favoriteMapper;
        this.auditLogMapper = auditLogMapper;
    }

    /** 列表查询 */
    @GetMapping
    public Result<List<CommunityPost>> list(@CurrentUser LoginUser me,
                                            @RequestParam(required = false) String status,
                                            @RequestParam(required = false) String cat,
                                            @RequestParam(required = false) String city,
                                            @RequestParam(required = false, defaultValue = "latest") String sort,
                                            @RequestParam(required = false, defaultValue = "false") boolean mine) {
        LambdaQueryWrapper<CommunityPost> q = new LambdaQueryWrapper<>();
        if (mine) {
            q.eq(CommunityPost::getUserId, me.userId());
        } else {
            // 非 admin 默认只看已审批通过的
            if (!"admin".equalsIgnoreCase(me.role())) {
                q.eq(CommunityPost::getStatus, "approved");
            } else if (status != null && !status.isBlank()) {
                q.eq(CommunityPost::getStatus, status);
            }
        }
        if (cat != null && !cat.isBlank()) q.eq(CommunityPost::getCat, cat);
        if (city != null && !city.isBlank()) q.eq(CommunityPost::getCity, city);

        switch (sort) {
            case "hot" -> q.orderByDesc(CommunityPost::getLikes)
                    .orderByDesc(CommunityPost::getViews);
            case "views" -> q.orderByDesc(CommunityPost::getViews);
            case "comments" -> q.orderByDesc(CommunityPost::getComments);
            default -> q.orderByDesc(CommunityPost::getCreatedAt);
        }
        return Result.ok(postMapper.selectList(q));
    }

    /** 创建帖子 */
    @PostMapping
    public Result<CommunityPost> create(@CurrentUser LoginUser me,
                                        @RequestBody CommunityPost post) {
        post.setUserId(me.userId());
        post.setAuthorName(me.username());
        // admin 直接通过，普通用户默认 pending
        post.setStatus("admin".equalsIgnoreCase(me.role()) ? "approved" : "pending");
        if (post.getLikes() == null) post.setLikes(0);
        if (post.getComments() == null) post.setComments(0);
        if (post.getViews() == null) post.setViews(0);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        postMapper.insert(post);
        return Result.ok(post);
    }

    /** 审核通过 */
    @PutMapping("/{id}/approve")
    public Result<Object> approve(@CurrentUser LoginUser me,
                                  @PathVariable Long id,
                                  @RequestBody(required = false) Map<String, String> body) {
        if (!"admin".equalsIgnoreCase(me.role())) {
            return Result.fail(403, "仅管理员可操作");
        }
        String reason = body == null ? "" : body.getOrDefault("reason", "");
        postMapper.update(null, new LambdaUpdateWrapper<CommunityPost>()
                .eq(CommunityPost::getId, id)
                .set(CommunityPost::getStatus, "approved")
                .set(CommunityPost::getUpdatedAt, LocalDateTime.now()));

        saveAuditLog(id, me.userId(), "approve", reason);
        return Result.ok();
    }

    /** 审核驳回 */
    @PutMapping("/{id}/reject")
    public Result<Object> reject(@CurrentUser LoginUser me,
                                 @PathVariable Long id,
                                 @RequestBody(required = false) Map<String, String> body) {
        if (!"admin".equalsIgnoreCase(me.role())) {
            return Result.fail(403, "仅管理员可操作");
        }
        String reason = body == null ? "" : body.getOrDefault("reason", "");
        postMapper.update(null, new LambdaUpdateWrapper<CommunityPost>()
                .eq(CommunityPost::getId, id)
                .set(CommunityPost::getStatus, "rejected")
                .set(CommunityPost::getRejectReason, reason)
                .set(CommunityPost::getUpdatedAt, LocalDateTime.now()));

        saveAuditLog(id, me.userId(), "reject", reason);
        return Result.ok();
    }

    /** 删除 */
    @DeleteMapping("/{id}")
    public Result<Object> delete(@CurrentUser LoginUser me, @PathVariable Long id) {
        CommunityPost post = postMapper.selectById(id);
        if (post == null) return Result.fail(404, "帖子不存在");
        if (!post.getUserId().equals(me.userId()) && !"admin".equalsIgnoreCase(me.role())) {
            return Result.fail(403, "无权删除");
        }
        postMapper.deleteById(id);
        return Result.ok();
    }

    /** 点赞 */
    @PostMapping("/{id}/like")
    public Result<Object> like(@CurrentUser LoginUser me, @PathVariable Long id) {
        CommunityPost post = postMapper.selectById(id);
        if (post == null) return Result.fail(404, "帖子不存在");
        int likes = (post.getLikes() == null ? 0 : post.getLikes()) + 1;
        postMapper.update(null, new LambdaUpdateWrapper<CommunityPost>()
                .eq(CommunityPost::getId, id)
                .set(CommunityPost::getLikes, likes));
        post.setLikes(likes);
        return Result.ok();
    }

    /** 收藏帖子 */
    @PostMapping("/{id}/fav")
    public Result<Object> fav(@CurrentUser LoginUser me, @PathVariable Long id) {
        CommunityPost post = postMapper.selectById(id);
        if (post == null) return Result.fail(404, "帖子不存在");

        // 检查是否已收藏
        Long dup = favoriteMapper.selectCount(new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getUserId, me.userId())
                .eq(Favorite::getFavType, "post")
                .eq(Favorite::getTargetId, id));
        if (dup != null && dup > 0) {
            return Result.fail(400, "已收藏过");
        }

        Favorite fav = new Favorite();
        fav.setUserId(me.userId());
        fav.setFavType("post");
        fav.setTargetId(id);
        fav.setTargetName(post.getTitle());
        fav.setCoverImg(post.getAuthorAvatar());
        fav.setSavedAt(LocalDateTime.now());
        favoriteMapper.insert(fav);
        return Result.ok();
    }

    /** 当前用户所有帖子 */
    @GetMapping("/mine")
    public Result<List<CommunityPost>> mine(@CurrentUser LoginUser me) {
        return Result.ok(postMapper.selectList(
                new LambdaQueryWrapper<CommunityPost>()
                        .eq(CommunityPost::getUserId, me.userId())
                        .orderByDesc(CommunityPost::getCreatedAt)
        ));
    }

    /** 详情 */
    @GetMapping("/{id}")
    public Result<CommunityPost> detail(@CurrentUser LoginUser me, @PathVariable Long id) {
        CommunityPost post = postMapper.selectById(id);
        if (post == null) return Result.fail(404, "帖子不存在");
        // views +1
        int views = (post.getViews() == null ? 0 : post.getViews()) + 1;
        postMapper.update(null, new LambdaUpdateWrapper<CommunityPost>()
                .eq(CommunityPost::getId, id).set(CommunityPost::getViews, views));
        post.setViews(views);
        return Result.ok(post);
    }

    /** 评论列表 */
    @GetMapping("/{id}/comments")
    public Result<List<PostComment>> comments(@CurrentUser LoginUser me, @PathVariable Long id) {
        return Result.ok(commentMapper.selectList(
                new LambdaQueryWrapper<PostComment>()
                        .eq(PostComment::getPostId, id)
                        .orderByAsc(PostComment::getCreatedAt)
        ));
    }

    /** 发表评论 */
    @PostMapping("/{id}/comments")
    public Result<PostComment> addComment(@CurrentUser LoginUser me,
                                          @PathVariable Long id,
                                          @RequestBody PostComment comment) {
        CommunityPost post = postMapper.selectById(id);
        if (post == null) return Result.fail(404, "帖子不存在");

        comment.setPostId(id);
        comment.setUserId(me.userId());
        comment.setCreatedAt(LocalDateTime.now());
        commentMapper.insert(comment);

        // 回复评论数
        int comments = (post.getComments() == null ? 0 : post.getComments()) + 1;
        postMapper.update(null, new LambdaUpdateWrapper<CommunityPost>()
                .eq(CommunityPost::getId, id).set(CommunityPost::getComments, comments));
        return Result.ok(comment);
    }

    private void saveAuditLog(Long postId, Long adminId, String action, String reason) {
        AuditLog log = new AuditLog();
        log.setPostId(postId);
        log.setAdminId(adminId);
        log.setAction(action);
        log.setReason(reason);
        log.setCreatedAt(LocalDateTime.now());
        auditLogMapper.insert(log);
    }
}
