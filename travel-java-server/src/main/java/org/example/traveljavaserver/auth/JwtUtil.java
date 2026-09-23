package org.example.traveljavaserver.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 工具类（JJWT 0.12）
 */
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expireMillis;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expire-hours}") int expireHours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expireMillis = expireHours * 3600_000L;
    }

    /** 生成 token */
    public String generate(Long userId, String role, String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("username", username);

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expireMillis))
                .signWith(key)
                .compact();
    }

    /** 解析 Claims，失败抛异常 */
    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** 验证 token 有效性 */
    public boolean validate(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long getUserId(Claims claims) {
        return claims.get("userId", Long.class);
    }

    public String getRole(Claims claims) {
        return claims.get("role", String.class);
    }

    public String getUsername(Claims claims) {
        return claims.get("username", String.class);
    }
}
