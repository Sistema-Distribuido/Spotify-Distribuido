package ufrpe.spotify.assinatura.Modulo.Assinatura.Serviços;


import org.springframework.stereotype.Service;
import ufrpe.spotify.assinatura.Modulo.Assinatura.Modelos.Assinatura;
import ufrpe.spotify.assinatura.Modulo.Assinatura.Repositorios.AssinaturaRepository;

import java.util.UUID;

@Service
public class ServiçoAssinatura {
    private final AssinaturaRepository assinaturaRepository;

    public ServiçoAssinatura(AssinaturaRepository repository) {
        this.assinaturaRepository = repository;
    }

    public boolean ehPremium(UUID usuario){
       return assinaturaRepository.findByUserId(usuario).map(
               sub -> sub.getPlano() == Assinatura.PlanType.PREMIUM &&
                       sub.getStatus() == Assinatura.SubscriptionStatus.ATIVO &&
                       (sub.getFimAssinatura() == null || sub.getFimAssinatura().isAfter(java.time.LocalDateTime.now())
                       )).orElse(false);


    }

    // atualiza um usuário para premium
    public Assinatura upgradePremium(UUID usuario){
        Assinatura user = assinaturaRepository.findByUserId(usuario).orElse(new Assinatura());

        user.setStatus(Assinatura.SubscriptionStatus.ATIVO);
        user.setPlano(Assinatura.PlanType.PREMIUM);
        user.setFimAssinatura(java.time.LocalDateTime.now().plusMonths(1));
        user.setId(usuario);

        return assinaturaRepository.save(user);

    }

}
