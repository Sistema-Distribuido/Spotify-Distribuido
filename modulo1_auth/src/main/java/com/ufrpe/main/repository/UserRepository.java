package com.ufrpe.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ufrpe.main.models.Usuario;
import org.springframework.security.core.userdetails.UserDetails;

public interface UserRepository extends JpaRepository<Usuario, String> {
    UserDetails findByUsername(String username);


}
