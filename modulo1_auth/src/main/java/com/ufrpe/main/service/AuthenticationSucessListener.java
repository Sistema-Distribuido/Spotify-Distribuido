package com.ufrpe.main.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationSucessListener implements ApplicationListener<AuthenticationSuccessEvent> {

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private LoginAttemptService loginAttemptService;


    @Override
    public void onApplicationEvent(AuthenticationSuccessEvent event) {
        final String xfHeader = request.getHeader("X-Forwarded-For");
        String key = xfHeader == null ? request.getRemoteAddr() : xfHeader.split(",")[0];

        loginAttemptService.loginSucesso(key);
    }
}
