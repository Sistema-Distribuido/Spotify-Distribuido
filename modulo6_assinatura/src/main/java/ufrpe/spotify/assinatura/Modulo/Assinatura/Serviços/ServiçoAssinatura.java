    package ufrpe.spotify.assinatura.Modulo.Assinatura.Serviços;


    import org.springframework.stereotype.Service;
    import ufrpe.spotify.assinatura.Modulo.Assinatura.Modelos.Assinatura;
    import ufrpe.spotify.assinatura.Modulo.Assinatura.Repositorios.AssinaturaRepository;

    import java.time.LocalDateTime;
    import java.util.UUID;

    @Service
    public class ServiçoAssinatura {
        private final AssinaturaRepository assinaturaRepository;

        public ServiçoAssinatura(AssinaturaRepository repository) {
            this.assinaturaRepository = repository;
        }

        public boolean ehPremium(int usuario){
           return assinaturaRepository.findByUserId(usuario).map(
                   sub -> sub.getPlano() == Assinatura.PlanType.PREMIUM &&
                           sub.getStatus() == Assinatura.SubscriptionStatus.ATIVO &&
                           (sub.getFimAssinatura() == null || sub.getFimAssinatura().isAfter(java.time.LocalDateTime.now())
                           )).orElse(false);


        }

        public Assinatura upgradePremium(int usuario) {

            Assinatura assinatura = assinaturaRepository.findByUserId(usuario)
                    .orElseGet(() -> {
                        // Se não encontrar no banco, entra aqui e cria um novo
                        Assinatura nova = new Assinatura();
                        nova.setUserId(usuario);
                        return nova;
                    });

            // Atualiza os dados (seja da nova ou da que veio do banco)
            assinatura.setStatus(Assinatura.SubscriptionStatus.ATIVO);
            assinatura.setPlano(Assinatura.PlanType.PREMIUM);
            assinatura.setFimAssinatura(LocalDateTime.now().plusMonths(1));

            return assinaturaRepository.save(assinatura);
        }

    }
