package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    
    // Find who a user is following
    List<Follow> findByFollowerUserId(Long followerId);
    
    // Find a user's followers
    List<Follow> findByFollowingUserId(Long followingId);
    
    // Find specific follow relationship
    Optional<Follow> findByFollowerUserIdAndFollowingUserId(Long followerId, Long followingId);
    
    // Check if user follows another user
    boolean existsByFollowerUserIdAndFollowingUserId(Long followerId, Long followingId);
    
    // Count followers
    long countByFollowingUserId(Long followingId);
    
    // Count following
    long countByFollowerUserId(Long followerId);
    
    // Delete follow relationship
    void deleteByFollowerUserIdAndFollowingUserId(Long followerId, Long followingId);
    
    // Get follower count for seller
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following.userId = :sellerId")
    long getFollowerCount(@Param("sellerId") Long sellerId);
}