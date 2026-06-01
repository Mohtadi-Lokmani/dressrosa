package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.CollectionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionItemRepository extends JpaRepository<CollectionItem, Long> {
    List<CollectionItem> findByCollectionCollectionIdOrderByPositionAsc(Long collectionId);
    long countByCollectionCollectionId(Long collectionId);
    boolean existsByCollectionCollectionIdAndProductProductId(Long collectionId, Long productId);
    Optional<CollectionItem> findByCollectionCollectionIdAndProductProductId(Long collectionId, Long productId);
}

