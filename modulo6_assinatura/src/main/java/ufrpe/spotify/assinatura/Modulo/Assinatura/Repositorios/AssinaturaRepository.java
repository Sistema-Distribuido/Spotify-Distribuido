package ufrpe.spotify.assinatura.Modulo.Assinatura.Repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import ufrpe.spotify.assinatura.Modulo.Assinatura.Modelos.Assinatura;

import java.util.Optional;
import java.util.UUID;

public interface AssinaturaRepository extends JpaRepository<Assinatura, UUID> {
    Optional<Assinatura> findByUserId(UUID userId);
}
