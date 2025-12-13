package ufrpe.spotify.assinatura.Modulo.Assinatura.Modelos;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="Assinatura")
@Data
public class Assinatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Apenas armazenamos o ID do usuário (chave estrangeira lógica)
    @Column(name = "user_id", unique = true, nullable = false)
    private int userId;

    @Enumerated(EnumType.STRING)
    private PlanType plano;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status;

    private LocalDateTime fimAssinatura;

    // Enums auxiliares
    public enum PlanType { FREE, PREMIUM, ADMIN }
    public enum SubscriptionStatus { ATIVO, CANCELADO, PENDENTE }
}

