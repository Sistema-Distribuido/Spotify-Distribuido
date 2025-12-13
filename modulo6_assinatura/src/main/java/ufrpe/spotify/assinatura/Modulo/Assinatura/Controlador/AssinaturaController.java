package ufrpe.spotify.assinatura.Modulo.Assinatura.Controlador;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ufrpe.spotify.assinatura.Modulo.Assinatura.Serviços.ServiçoAssinatura;

import java.util.Map;
import java.util.UUID;




@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/assinatura")
public class AssinaturaController {
    private final ServiçoAssinatura serviçoAssinatura;

    public AssinaturaController(ServiçoAssinatura serviçoAssinatura){
        this.serviçoAssinatura = serviçoAssinatura;
    }


    @CrossOrigin(origins = "*")
    @GetMapping("/status/{userID}")
    public ResponseEntity<?> verificarStatus(@PathVariable int userID){
        boolean ehPremium = serviçoAssinatura.ehPremium(userID);

        return ResponseEntity.ok(Map.of(
                "userId", userID,
                "premium", ehPremium,
                "message", ehPremium ? "Aproveite músicas ilimitadas!" : "Veja uma propaganda para continuar."
        ));


    }


    @CrossOrigin(origins = "*")
    @PostMapping("/upgrade/{userID}")
    public ResponseEntity<?> upgrade(@PathVariable int userID){
        serviçoAssinatura.upgradePremium(userID);
        return ResponseEntity.ok(Map.of(
                "userId", userID,
                "premium", true,
                "message", "Conta atualizada para Premium"
        ));
    }
}
