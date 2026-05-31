package com.trithienviet.qlchuoiphongtro.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.trithienviet.qlchuoiphongtro.security.JWTFilter;
import com.trithienviet.qlchuoiphongtro.service.impl.UserDetailsServiceImpl;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JWTFilter jwtFilter;

    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    /**
     * BỘ LỌC BẢO MẬT - THỨ TỰ QUAN TRỌNG (first-match-wins):
     *
     * 1. PUBLIC_URLS   → permitAll()
     * 2. USER_URLS     → TENANT + ADMIN
     * 3. GUARD_URLS    → STAFF + ADMIN  (bãi xe)
     * 4. STAFF_URLS    → STAFF + ADMIN  (PHẢI ĐẶT TRƯỚC ADMIN_URLS!)
     *    └─ Bao gồm các /api/admin/contracts/**, /api/admin/profiles, v.v.
     *       để override catch-all /api/admin/** của ADMIN_URLS
     * 5. ADMIN_URLS    → ADMIN only     (catch-all /api/admin/**)
     * 6. anyRequest    → authenticated
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(requests -> requests

                // ── 1. Public (không cần đăng nhập) ────────────────────
                .requestMatchers(AppConstants.PUBLIC_URLS).permitAll()

                // ── 2. Tenant ────────────────────────────────────────────
                .requestMatchers(AppConstants.USER_URLS).hasAnyRole("TENANT", "STAFF", "ADMIN")

                // ── 3. Guard / Bảo vệ bãi xe ────────────────────────────
                .requestMatchers(AppConstants.GUARD_URLS).hasAnyRole("STAFF", "ADMIN")

                // ── 4. STAFF (ĐẶT TRƯỚC ADMIN_URLS) ─────────────────────
                // Các sub-path /api/admin/** mà STAFF được phép sẽ match tại đây
                // trước khi catch-all /api/admin/** ở bước 5 chặn lại
                .requestMatchers(AppConstants.STAFF_URLS).hasAnyRole("STAFF", "ADMIN")

                // ── 5. Admin catch-all (các /api/admin/** còn lại) ───────
                .requestMatchers(AppConstants.ADMIN_URLS).hasRole("ADMIN")

                // ── 6. Mọi request khác phải đăng nhập ──────────────────
                .anyRequest().authenticated()
            )
            .exceptionHandling(handling -> handling
                .authenticationEntryPoint((request, response, authException) -> 
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden"))
            )
            .sessionManagement(management -> management
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .authenticationProvider(daoAuthenticationProvider());

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsServiceImpl);
        provider.setPasswordEncoder(passwordEncoder());
        provider.setHideUserNotFoundExceptions(false);
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); 
        configuration.setAllowCredentials(true);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}