package org.example.traveljavaserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.entity.User;
import org.example.traveljavaserver.mapper.UserMapper;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 用户资料 —— 需 JWT
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserMapper userMapper;

    public UserController(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @GetMapping("/me")
    public Result<User> me(@CurrentUser LoginUser me) {
        User user = userMapper.selectById(me.userId());
        if (user == null) return Result.fail(404, "用户不存在");
        return Result.ok(AuthController.toUserView(user));
    }

    @PutMapping("/me")
    public Result<User> updateMe(@CurrentUser LoginUser me,
                                 @RequestBody Map<String, Object> body) {
        User user = userMapper.selectById(me.userId());
        if (user == null) return Result.fail(404, "用户不存在");

        if (body.containsKey("sign")) user.setSign((String) body.get("sign"));
        if (body.containsKey("origin")) user.setOrigin((String) body.get("origin"));
        if (body.containsKey("budget")) user.setBudget((String) body.get("budget"));
        if (body.containsKey("interests")) user.setInterests((String) body.get("interests"));
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("avatar")) user.setAvatar((String) body.get("avatar"));
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        // 若同时更新 username
        if (body.containsKey("username")) {
            String newUsername = (String) body.get("username");
            User dup = userMapper.selectOne(
                    new LambdaQueryWrapper<User>()
                            .eq(User::getUsername, newUsername)
                            .ne(User::getId, user.getId())
            );
            if (dup == null) {
                user.setUsername(newUsername);
                userMapper.updateById(user);
            }
        }

        return Result.ok(AuthController.toUserView(user));
    }
}
