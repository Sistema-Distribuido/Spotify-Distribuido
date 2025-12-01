package com.ufrpe.main.service;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {
    private final int tentativas = 3;
    private final long BLOCK_DURATION_MINUTES = 15;
    private final LoadingCache<String, Integer> cache;
    private final ConcurrentHashMap<String, Long> blockedUsers = new ConcurrentHashMap<>();

    public LoginAttemptService() {
        super();
        cache = CacheBuilder.newBuilder()
                .expireAfterWrite(BLOCK_DURATION_MINUTES, TimeUnit.MINUTES) //bloqueio de 15 min após 3 tentativas
                .build(new  CacheLoader<String, Integer>() {
                    public Integer load(String key){
                        return 0;
                    }});
    }

    //chamado quando o login falhar
    public void loginFailed(String key){
        int tentativa = 0;
        try{
            tentativa = cache.get(key);
        }catch (ExecutionException e){
            tentativa = 0;
        }
        tentativa++;
        cache.put(key,tentativa);

        if(tentativa >= tentativas){
            long tempoDesbloqueado = System.currentTimeMillis() + (BLOCK_DURATION_MINUTES * 60 * 1000);
            blockedUsers.put(key,tempoDesbloqueado);
        }
    }

    public boolean isBlocked(String key) {
        // Verifica se existe um bloqueio registrado para esse IP
        if (blockedUsers.containsKey(key)) {
            long unlockTime = blockedUsers.get(key);

            // Se o tempo atual é menor que o tempo de desbloqueio, ainda está bloqueado
            if (System.currentTimeMillis() < unlockTime) {
                return true;
            } else {
                // O tempo já passou, removemos o bloqueio e limpamos o cache de tentativas
                blockedUsers.remove(key);
                cache.invalidate(key);
                return false;
            }
        }
        return false;
    }

    public long getSecondsRemaining(String key) {
        if (!blockedUsers.containsKey(key)) return 0;

        long unlockTime = blockedUsers.get(key);
        long now = System.currentTimeMillis();

        if (now >= unlockTime) return 0;

        // Retorna a diferença em segundos
        return (unlockTime - now) / 1000;
    }

    // reseta o contador se o login foi sucesso
    public void loginSucesso(String key){
        cache.invalidate(key);
    }

}
