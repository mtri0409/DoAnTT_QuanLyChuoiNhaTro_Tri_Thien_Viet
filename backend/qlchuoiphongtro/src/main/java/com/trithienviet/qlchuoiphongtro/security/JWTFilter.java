package com.trithienviet.qlchuoiphongtro.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.trithienviet.qlchuoiphongtro.service.impl.UserDetailsServiceImpl;

import java.io.IOException;

@Component
public class JWTFilter extends OncePerRequestFilter {

    @Autowired private JWTUtil jwtUtil;
    @Autowired private  UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                // Đổi tên biến cho đúng bản chất
                String username = jwtUtil.validateTokenAndRetrieveSubject(jwt);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Gọi hàm tìm kiếm bằng username
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (JWTVerificationException e) {
                // Log lỗi: Token không hợp lệ hoặc hết hạn
                System.out.println("❌ JWT Verification failed: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}