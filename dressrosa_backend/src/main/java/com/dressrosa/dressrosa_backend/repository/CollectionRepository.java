package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {
    List<Collection> findBySellerUserIdOrderByCreatedAtDesc(Long sellerId);
}

