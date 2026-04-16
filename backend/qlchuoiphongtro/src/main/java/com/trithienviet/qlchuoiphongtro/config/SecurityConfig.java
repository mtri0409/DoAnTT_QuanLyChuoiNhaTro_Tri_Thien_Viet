package com.trithienviet.qlchuoiphongtro.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
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
@EnableWebSecurity // Kích hoạt tính năng Security cho dự án Web
@EnableMethodSecurity // Cho phép dùng @PreAuthorize("hasRole('...')") ở Controller
public class SecurityConfig {

    @Autowired
    private JWTFilter jwtFilter;

    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    // --- 1. CẤU HÌNH BỘ LỌC BẢO MẬT (Security Filter Chain) ---
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http

            .csrf(csrf -> csrf.disable()) // Tắt CSRF vì JWT không cần (chống tấn công giả mạo yêu cầu)
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Cấu hình chia sẻ tài nguyên (CORS) cho React gọi API
            .authorizeHttpRequests(requests -> requests
                // Cho phép các URL công khai (Login, Register) vào tự do
                .requestMatchers(AppConstants.PUBLIC_URLS).permitAll()
                // CẤU HÌNH QUYỀN TRUY CẬP: 
                .requestMatchers(AppConstants.USER_URLS).hasAnyRole("TENANT", "ADMIN")
                .requestMatchers(AppConstants.ADMIN_URLS).hasAnyRole("ADMIN","STAFF")
                // Tất cả các request còn lại đều phải đăng nhập mới được vào
                .anyRequest().authenticated()
            )
            // Cấu hình xử lý lỗi khi chưa đăng nhập (Unauthorized)
            .exceptionHandling(handling -> handling
                .authenticationEntryPoint((request, response, authException) -> 
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")))
            // CHẾ ĐỘ STATELESS: Không tạo Session trên Server (Dành riêng cho JWT)
            .sessionManagement(management -> management
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // THỨ TỰ CHẠY: Chạy bộ lọc JWT trước khi kiểm tra Username/Password mặc định của Spring
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .authenticationProvider(daoAuthenticationProvider());


        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsServiceImpl);
        // provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        provider.setHideUserNotFoundExceptions(false); // For better debugging
        return provider;
    }

    // --- 3. CÔNG CỤ MÃ HÓA MẬT KHẨU ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Mã hóa mật khẩu một chiều cực mạnh
    }

    // --- 4. QUẢN LÝ XÁC THỰC (Dùng trong AuthController để Login) ---
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // --- 5. CẤU HÌNH CORS: Cho phép Frontend (React/Vite) kết nối ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Liệt kê các địa chỉ của Frontend được phép gọi đến Backend
        configuration.setAllowedOrigins(List.of(

                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5174"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));

        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true); // Cho phép gửi Token/Cookie kèm theo

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho toàn bộ API
        return source;
    }
}