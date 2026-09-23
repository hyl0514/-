package org.example.traveljavaserver.auth;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT 认证拦截器
 */
@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    public static final String CURRENT_USER_ATTR = "__CURRENT_USER__";

    private final JwtUtil jwtUtil;

    public JwtAuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            writeUnauthorized(response, "缺少 Authorization Bearer token");
            return false;
        }

        String token = header.substring(7);
        Claims claims;
        try {
            claims = jwtUtil.parse(token);
        } catch (Exception e) {
            writeUnauthorized(response, "token 无效或已过期");
            return false;
        }

        Long userId = claims.get("userId", Long.class);
        String role = claims.get("role", String.class);
        String username = claims.get("username", String.class);

        LoginUser loginUser = new LoginUser(userId, username, role);
        request.setAttribute(CURRENT_USER_ATTR, loginUser);
        return true;
    }

    private void writeUnauthorized(HttpServletResponse response, String msg) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        String json = "{\"success\":false,\"code\":401,\"message\":\"" + escape(msg) + "\"}";
        response.getWriter().write(json);
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ");
    }
}
