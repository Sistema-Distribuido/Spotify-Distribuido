package com.ufrpe.main.models;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Representa uma resposta padrão da API, geralmente para status ou mensagens de erro.
 * O uso de 'record' é uma forma moderna e concisa de criar classes DTO imutáveis.
 */
public record APIresponse(

        @Schema(description = "Mensagem descritiva da resposta da API", example = "Registro realizado com sucesso!")
        String message
) {
}