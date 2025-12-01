package com.ufrpe.main.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// A anotação @ResponseStatus instrui o Spring a responder com o status HTTP
// especificado sempre que esta exceção for lançada por um controller.
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
