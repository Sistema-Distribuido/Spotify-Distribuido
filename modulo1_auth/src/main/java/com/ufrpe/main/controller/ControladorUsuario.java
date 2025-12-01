package com.ufrpe.main.controller;

import com.ufrpe.main.models.APIresponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ControladorUsuario {
    private final JdbcTemplate jdbcTemplate;

    public ControladorUsuario(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // simplesmente usa a string do usuario como entrada para a gerar o código sql de busca
    @GetMapping("/usuarios/vulneravel")
    public List<Map<String, Object>> buscarUsuarioVulneravel(@RequestParam String username) {
        String sql = "SELECT * FROM usuario WHERE username = '" + username + "'";
        return jdbcTemplate.queryForList(sql);
    }

    // separa a consulta em 2 etapas
    // 1- Faz uma "pré-consulta" ao banco de dados com a entrada: SELECT * FROM usuario WHERE username = ?
    // isso diz ao banco de dados que a consulta é uma select, e o filtro do where é através do username
    // 2- após isso, usa a string do usuario no lugar do "?", então ele vai consultar com o username sendo literalmente igual a string de entrada

    @GetMapping("/usuarios/seguro")
    public List<Map<String, Object>> buscarUsuarioSeguro(@RequestParam String username) {
        String sql = "SELECT * FROM usuario WHERE username = ?";
        return jdbcTemplate.queryForList(sql, username);
    }

    @GetMapping("/usuarios/menuAdmin")
    public Map<String, String> menuAdmin() {
        // Collections.singletonMap cria um Map imutável com apenas uma entrada.
        return Collections.singletonMap("mensagem", "Bem vindo administrador");
    }
    @GetMapping("/usuarios/menuUser")
    public Map<String, String> menuUser() {
        // Collections.singletonMap cria um Map imutável com apenas uma entrada.
        return Collections.singletonMap("mensagem", "Bem vindo usuario");
    }

}
