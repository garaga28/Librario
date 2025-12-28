package com.librario.config;


import com.librario.filter.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Autowired
    private UserDetailsService userDetailsService;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http

                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/user/login",
                                "/api/auth/login/{role}",
                                "/api/auth/register",
                                "/api/auth/**",
                                "/ws/**",
                                "/api/members/**",
                                "/api/auth/librarian/login",
                                "/api/user/librarians",
                                "/api/user/librarians/{id}",
                                "/api/auth/admin/login",
                                "/api/auth/forgot-password",
                                "/api/auth/verify-otp",
                                "/api/auth/reset-password",
                                "/api/books",
                                "/api/books/add",
                                "/api/books/{id}",
                                "/api/users",
                                "/api/members",
                                "/api/members/{id}",
                                "/api/members/by-user/**",
                                "/api/renewals/request/{memberId}",
                                "/api/renewals/pending",
                                "/api/renewals/{requestId}/{action}",
                                "/api/renewals/pending/{memberId}",
                                "/api/user/profile**",
                                "/api/user/update**",
                                "/api/borrowings/member/{memberId}",
                                "/api/borrowings/borrow",
                                "/api/borrowings/return",
                                "/api/borrowings/returned/{memberId}",
                                "/api/overdue/**",
                                "/api/overdue/books",
                                "/api/overdue/books/member/{memberId}",
                                "/api/memberships/user/{memberId}",
                                "/api/user/members",
                                "/api/user/librarian",
                                "/api/members/all-with-details",
                                "/api/librarian/borrowed-books",
                                "/api/borrowings/librarian/return/{id}",
                                "/api/borrowing-requests/user/pending/member/{memberId}",
                                "/api/borrowing-requests/**",
                                "/api/borrowings/librarian/borrow",
                                "/api/payments/**",

                                "/api/payments/history/all",
                                "/api/payments/verifyPayment",
                                "/api/payments/history/member/**",
                                "/api/payments/createOnlineOrder",
                                "/api/librarian/profile",
                                "/api/notifications/**",
                                "/api/notifications/librarian",
                                "/api/notifications/librarian/**",
                                "/api/notifications/librarian/{userId}",
                                "/api/notifications/mark-all-read/{userId}",
                                "/api/notifications/mark-all-read",
                                "/api/notifications/mark-as-read/{notificationId}",
                                "/api/notifications/member ",
                                "/api/notifications/mark-all-read/member",
                                "/websocket/info",
                                "/websocket/**"

                        ).permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/renewals/request/{memberId}").authenticated()
                        .requestMatchers("/api/members/**", "/api/books/**", "/api/borrowing-requests/**").hasAnyRole("ADMIN", "LIBRARIAN")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
