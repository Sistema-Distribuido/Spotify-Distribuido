package com.ufrpe.main.service;

import com.ufrpe.main.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    TokenService tokenService;
    @Autowired
    private UserRepository userRepository;
    /*
    // Lista de paths que o filtro deve IGNORAR
    private final List<AntPathRequestMatcher> excludedMatchers = Arrays.asList(
            new AntPathRequestMatcher("/swagger-ui/**"),
            new AntPathRequestMatcher("/swagger-ui.html"),
            new AntPathRequestMatcher("/v3/api-docs/**"),
            new AntPathRequestMatcher("/auth/login"),
            new AntPathRequestMatcher("/auth/register")
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Se a requisição corresponder a qualquer um dos paths da lista, o filtro NÃO será executado.
        return excludedMatchers.stream().anyMatch(matcher -> matcher.matches(request));
    }
*/
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);
        if (token != null) {
            try {
                var login = tokenService.validateToken(token);
                UserDetails user = userRepository.findByUsername(login);

                // o token pode ser de um usuário que não existe mais no banco de dados, então é necessário verificar
                if (user != null) {
                    var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }catch (Exception ex){
                // captura tokens mal formados ou com defeitos
                System.err.println("Token JWT inválido: " + ex.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        var header = request.getHeader("Authorization");
        if(header == null){
            return null;
        }
        return header.replace("Bearer ", "");
    }
}
