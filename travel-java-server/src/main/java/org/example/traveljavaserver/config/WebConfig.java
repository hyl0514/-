package org.example.traveljavaserver.config;

import org.example.traveljavaserver.auth.JwtAuthInterceptor;
import org.example.traveljavaserver.auth.LoginUserArgumentResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web MVC 配置：JWT 拦截器 + 参数解析器
 * CORS 已由 common/CorsConfig 通过 CorsFilter 统一处理（允许所有来源、凭证、所有方法/头）。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final JwtAuthInterceptor jwtAuthInterceptor;
    private final LoginUserArgumentResolver loginUserArgumentResolver;

    public WebConfig(JwtAuthInterceptor jwtAuthInterceptor,
                     LoginUserArgumentResolver loginUserArgumentResolver) {
        this.jwtAuthInterceptor = jwtAuthInterceptor;
        this.loginUserArgumentResolver = loginUserArgumentResolver;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtAuthInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/**",
                        "/error",
                        "/webjars/**",
                        "/favicon.ico"
                );
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(loginUserArgumentResolver);
    }
}
