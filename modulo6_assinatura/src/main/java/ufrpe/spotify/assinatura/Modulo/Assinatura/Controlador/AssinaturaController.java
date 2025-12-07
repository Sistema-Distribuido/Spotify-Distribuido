package ufrpe.spotify.assinatura.Modulo.Assinatura.Controlador;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ufrpe.spotify.assinatura.Modulo.Assinatura.Serviços.ServiçoAssinatura;

import java.util.Map;
import java.util.UUID;



@RestController
@RequestMapping("/api/assinatura")
public class AssinaturaController {
    private final ServiçoAssinatura serviçoAssinatura;

    public AssinaturaController(ServiçoAssinatura serviçoAssinatura){
        this.serviçoAssinatura = serviçoAssinatura;
    }

    public ResponseEntity<?> verificarStatus(@PathVariable UUID userID){
        boolean ehPremium = serviçoAssinatura.ehPremium(userID);

        return ResponseEntity.ok(Map.of(
                "userId", userID,
                "premium", ehPremium,
                "message", ehPremium ? "Aproveite músicas ilimitadas!" : "Veja uma propaganda para continuar."
        ));


    }
}
