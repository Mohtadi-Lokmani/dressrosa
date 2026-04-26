package com.dressrosa.dressrosa_backend.repository;
import com.dressrosa.dressrosa_backend.model.Role;
import com.dressrosa.dressrosa_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by email (for login)
    Optional<User> findByEmail(String email);
    
    // Check if email exists (for registration validation)
    boolean existsByEmail(String email);
    
    // Check if telephone exists (for uniqueness validation)
    boolean existsByTelephone(String telephone);
    
    // Find users by role
    List<User> findByRole(Role role);
    
    // Find all sellers
    @Query("SELECT u FROM User u WHERE u.role = 'SELLER'")
    List<User> findAllSellers();
    
    // Find verified sellers
    @Query("SELECT u FROM User u WHERE u.role = 'SELLER' AND u.verificationBadge = true")
    List<User> findVerifiedSellers();
    
    // Search users by name
    List<User> findByUserNameContainingIgnoreCase(String userName);
    
    // Find users by verification status
    List<User> findByIsVerified(Boolean isVerified);
}