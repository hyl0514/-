package org.example.traveljavaserver.auth;

/**
 * 当前登录用户快照
 */
public record LoginUser(Long userId, String username, String role) {
}
