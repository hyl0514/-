package org.example.traveljavaserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.traveljavaserver.auth.JwtUtil;
import org.example.traveljavaserver.dto.LoginRequest;
import org.example.traveljavaserver.entity.User;
import org.example.traveljavaserver.mapper.UserMapper;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证接口 —— 无需 JWT
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    public AuthController(UserMapper userMapper, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest req) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, req.getUsername())
        );
        if (user == null) {
            return Result.fail(404, "用户不存在");
        }
        // 生产环境建议 BCrypt；这里先用直接对比方便测试
        if (!req.getPassword().equals(user.getPassword())) {
            return Result.fail(401, "密码错误");
        }
        // users.status 为 TINYINT：1=正常，0=禁用
        if (!"1".equals(user.getStatus())) {
            return Result.fail(403, "账号已被禁用");
        }

        String token = jwtUtil.generate(user.getId(), user.getRole(), user.getUsername());

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", toUserView(user));
        return Result.ok(data);
    }

    /**
     * 简易注册（便于本地调试）
     */
    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        User exist = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, user.getUsername())
        );
        if (exist != null) {
            return Result.fail(400, "用户名已存在");
        }
        if (user.getRole() == null) user.setRole("user");
        if (user.getStatus() == null) user.setStatus("normal");
        userMapper.insert(user);
        user.setPassword(null);
        return Result.ok(user);
    }

    /**
     * 去除密码的用户视图
     */
    public static User toUserView(User u) {
        if (u == null) return null;
        User view = new User();
        view.setId(u.getId());
        view.setUsername(u.getUsername());
        view.setRole(u.getRole());
        view.setName(u.getName());
        view.setAvatar(u.getAvatar());
        view.setSign(u.getSign());
        view.setOrigin(u.getOrigin());
        view.setBudget(u.getBudget());
        view.setInterests(u.getInterests());
        view.setStatus(u.getStatus());
        view.setCreatedAt(u.getCreatedAt());
        view.setUpdatedAt(u.getUpdatedAt());
        return view;
    }
}
