package com.librario.config;

import com.librario.Entity.User;
import com.librario.Repo.SessionRepo;
import com.librario.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class CustomSessionTokenFilter extends OncePerRequestFilter {

    @Autowired
    private SessionRepo sessionRepo;

    @Autowired
    private UserRepo userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<com.librario.Entity.Session> sessionOptional = sessionRepo.findByToken(token);
            if (sessionOptional.isPresent()) {
                com.librario.Entity.Session session = sessionOptional.get();
                Optional<User> userOptional = userRepo.findById(session.getUserId());
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName());
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user.getEmail(), null, Collections.singletonList(authority));
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}