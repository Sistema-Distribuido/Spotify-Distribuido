package com.ufrpe.main.controller;

import com.ufrpe.main.exceptions.InvalidCredentialsException;
import com.ufrpe.main.models.*;
import com.ufrpe.main.repository.UserRepository;
import com.ufrpe.main.service.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Operation(summary = "Realizar Login", description = "Autentica um usuário e retorna um token JWT.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponseDTO.class))),
            @ApiResponse(responseCode = "403", description = "Credenciais inválidas ou conta bloqueada",
                    content = @Content), // Sem conteúdo no corpo ou definir um schema de erro
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                    content = @Content(schema = @Schema(implementation = APIresponse.class)))
    })
    // Utiliza a autenticação padrão do springboot, passando login e senha e então retorna um token do usuario
    @PostMapping("/login")
    public ResponseEntity login(@RequestBody AuthDTO data){
        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.username(), data.password());
            var auth = this.authenticationManager.authenticate(usernamePassword);

            var token = tokenService.generateToken((Usuario) auth.getPrincipal());

            return ResponseEntity.ok(new LoginResponseDTO(token));
        }

        catch(AuthenticationException e){

            // verifica se a falha é por limite de logins
            // por algumas vezes, a de lockedexpecton acaba caindo em authentication expection
            if(e instanceof LockedException || e.getCause() instanceof LockedException) {
                throw new LockedException(e.getMessage());
            }

            // retona um objeto JSON com o código do erro, ID e horário
            throw new InvalidCredentialsException("Login ou senha inválidos");
        }

        catch (Exception e) {
            return ResponseEntity.status(500).body(new APIresponse("Erro interno " + e.getMessage()));
        }

    }
    // tags para personalizar o swagger
    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário no sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registro realizado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = APIresponse.class))),
            @ApiResponse(responseCode = "409", description = "Erro: Usuário já cadastrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = APIresponse.class)))
    })
    // recebe um JSON que contem nome, senha e cargo. Então criptografa a senha e armazena o novo usuario no repositorio
    @PostMapping("/register")
    public ResponseEntity register(@RequestBody RegisterDTO data){
        if(this.userRepository.findByUsername(data.username()) != null) return ResponseEntity.status(HttpStatus.CONFLICT).body(new APIresponse("Usuário já cadastrado! "));

        String encryptedPassword = passwordEncoder.encode(data.password());
        Usuario novoUsuario = new Usuario(data.username(), encryptedPassword, data.role());

        this.userRepository.save(novoUsuario);
        return ResponseEntity.ok(new APIresponse("Registro realizado com sucesso!"));

    }
}
