package com.ufrpe.main.service;

import com.ufrpe.main.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private LoginAttemptService loginAttemptService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        String ip = getClientIP();

        if(loginAttemptService.isBlocked(ip)){
            long segundosRestante = loginAttemptService.getSecondsRemaining(ip);
            long minutos = segundosRestante / 60;
            long segundos = segundosRestante % 60;

            String mensagemErro = String.format(
                    "Muitas tentativas de login. Tente novamente em %d minutos e %d segundos", minutos, segundos
            );
            throw new LockedException(mensagemErro);

        }

        var user = userRepository.findByUsername(username);
        if(user == null){
            throw new UsernameNotFoundException(username);
        }
        return user;
    }

    private String getClientIP() {
        final String xfHeader = request.getHeader("X-Forwarded-For");
        return (xfHeader == null) ? request.getRemoteAddr() : xfHeader.split(",")[0];
    }
}
