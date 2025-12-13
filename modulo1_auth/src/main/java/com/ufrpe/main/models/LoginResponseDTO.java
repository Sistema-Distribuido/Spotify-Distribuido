package com.ufrpe.main.models;

import java.util.UUID;

public record LoginResponseDTO(String token, int userId) {
}
