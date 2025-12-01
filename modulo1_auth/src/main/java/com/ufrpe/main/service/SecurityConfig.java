package com.ufrpe.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter SecurityFilter;

    private final ControleAcesso controleAcesso;

    // retorna mensagem de erro ao tentar utilizar um endpoint que possui nivel de acesso
    public SecurityConfig(ControleAcesso controleAcesso) {
        this.controleAcesso = controleAcesso;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                // permite que h2-console seja visualizado
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin())
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize ->  authorize
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**", "/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/menuAdmin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/menuUser").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(SecurityFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                .accessDeniedHandler(controleAcesso))
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration AuthcConfig) throws Exception {
        return AuthcConfig.getAuthenticationManager();

    }
    @Bean
    public PasswordEncoder  passwordEncoder() {
        return new Argon2PasswordEncoder(16,32,1,60000,10);
    }
}
