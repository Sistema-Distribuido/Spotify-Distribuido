package com.ufrpe.main.exceptions;

import com.ufrpe.main.models.APIresponse;
import com.ufrpe.main.models.ErrorResponse;
import com.ufrpe.main.models.UserRole;
import org.hibernate.query.SyntaxException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentialsException(
            InvalidCredentialsException ex, WebRequest request){
                ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(), // 401
                ex.getMessage(), // "Usuário ou senha inválido"
                LocalDateTime.now()
        );
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BadSqlGrammarException.class)
    public ResponseEntity<Map<String, Object>> handleBadJpqlGrammarException(BadSqlGrammarException ex ) {
        Map<String, Object> errorResponse = Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "erro", "Consulta inválida",
                "detalhe", "A sintaxe da consulta SQL está incorreta.",
                "timestamp", LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(SyntaxException.class)
    public ResponseEntity<Map<String, Object>> handleSyntaxException(SyntaxException ex ) {
        Map<String, Object> errorResponse = Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "erro", "Consulta inválida",
                "detalhe", "A sintaxe da consulta SQL está incorreta.",
                "timestamp", LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    // verifica o motivo do erro, e se for pelo enum, retorna o aviso de enums válidas, senão retorna a mensagem padrão
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleSyntaxException(HttpMessageNotReadableException ex ) {
        String mensagemPadrao = "Formato de requisição inválido";
        String Especifica =  mensagemPadrao;

        if(ex.getCause() != null  && ex.getMessage().contains("Enum")){
            String rolesValidas = Arrays.stream(UserRole.values())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));
            Especifica = "Role não aceita, os valores aceitos são: "+rolesValidas;
        }

        Map<String, Object> errorResponse = Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "erro", Especifica,
                "detalhe", "A role do usuário não existe",
                "timestamp", LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<Object> handleLockedException(LockedException ex) {
        // Retorna status 429 (Too Many Requests) ou 401/403
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new APIresponse(ex.getMessage()));
    }
}
