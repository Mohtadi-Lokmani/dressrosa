package com.dressrosa.dressrosa_backend.service;

import com.dressrosa.dressrosa_backend.dto.collection.CollectionCreateRequest;
import com.dressrosa.dressrosa_backend.dto.collection.CollectionResponse;
import com.dressrosa.dressrosa_backend.dto.product.ProductListResponse;
import com.dressrosa.dressrosa_backend.model.Collection;
import com.dressrosa.dressrosa_backend.model.CollectionItem;
import com.dressrosa.dressrosa_backend.model.Product;
import com.dressrosa.dressrosa_backend.model.ProductMedia;
import com.dressrosa.dressrosa_backend.model.User;
import com.dressrosa.dressrosa_backend.repository.CollectionItemRepository;
import com.dressrosa.dressrosa_backend.repository.CollectionRepository;
import com.dressrosa.dressrosa_backend.repository.ProductMediaRepository;
import com.dressrosa.dressrosa_backend.repository.ProductRepository;
import com.dressrosa.dressrosa_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CollectionService {

    @Autowired
    private CollectionRepository collectionRepository;

    @Autowired
    private CollectionItemRepository collectionItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMediaRepository productMediaRepository;

    @Autowired
    @Lazy
    private ProductService productService;

    public List<CollectionResponse> getSellerCollections(Long sellerId) {
        return collectionRepository.findBySellerUserIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<Long> getCollectionProductIds(Long collectionId, Long sellerId) {
        Collection c = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        if (!c.getSeller().getUserId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }
        return collectionItemRepository.findByCollectionCollectionIdOrderByPositionAsc(collectionId)
                .stream()
                .map(ci -> ci.getProduct().getProductId())
                .toList();
    }

    /** Public read: returns full product data for any visitor (no ownership check). */
    public List<ProductListResponse> getCollectionProducts(Long collectionId) {
        collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        return collectionItemRepository.findByCollectionCollectionIdOrderByPositionAsc(collectionId)
                .stream()
                .map(ci -> productService.convertToListResponsePublic(ci.getProduct()))
                .toList();
    }

    @Transactional
    public CollectionResponse createCollection(Long sellerId, CollectionCreateRequest request) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        Collection c = new Collection();
        c.setSeller(seller);
        c.setName(request.getName());
        c.setCoverImage(request.getCoverImage());
        Collection saved = collectionRepository.save(c);
        return toResponse(saved);
    }

    @Transactional
    public void deleteCollection(Long collectionId, Long sellerId) {
        Collection c = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        if (!c.getSeller().getUserId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }
        collectionRepository.delete(c);
    }

    @Transactional
    public void addProductToCollection(Long collectionId, Long productId, Long sellerId) {
        Collection c = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        if (!c.getSeller().getUserId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }

        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!p.getSeller().getUserId().equals(sellerId)) {
            throw new RuntimeException("You can only add your own products");
        }

        if (collectionItemRepository.existsByCollectionCollectionIdAndProductProductId(collectionId, productId)) {
            return;
        }

        CollectionItem item = new CollectionItem();
        item.setCollection(c);
        item.setProduct(p);
        item.setPosition((int) collectionItemRepository.countByCollectionCollectionId(collectionId));
        collectionItemRepository.save(item);

        // Auto cover image if missing
        if (c.getCoverImage() == null || c.getCoverImage().isBlank()) {
            List<ProductMedia> media = productMediaRepository.findByProductProductId(productId);
            if (!media.isEmpty()) {
                c.setCoverImage(media.get(0).getUrl());
                collectionRepository.save(c);
            }
        }
    }

    @Transactional
    public void removeProductFromCollection(Long collectionId, Long productId, Long sellerId) {
        Collection c = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        if (!c.getSeller().getUserId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }

        CollectionItem item = collectionItemRepository.findByCollectionCollectionIdAndProductProductId(collectionId, productId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        collectionItemRepository.delete(item);
    }

    private CollectionResponse toResponse(Collection c) {
        CollectionResponse r = new CollectionResponse();
        r.setCollectionId(c.getCollectionId());
        r.setName(c.getName());
        r.setCoverImage(c.getCoverImage());
        r.setCreatedAt(c.getCreatedAt());

        int count = (int) collectionItemRepository.countByCollectionCollectionId(c.getCollectionId());
        r.setItemsCount(count);

        List<String> previews = collectionItemRepository
                .findByCollectionCollectionIdOrderByPositionAsc(c.getCollectionId())
                .stream()
                .limit(4)
                .map(ci -> {
                    List<ProductMedia> media = productMediaRepository.findByProductProductId(ci.getProduct().getProductId());
                    return media.isEmpty() ? null : media.get(0).getUrl();
                })
                .filter(u -> u != null && !u.isBlank())
                .toList();
        r.setPreviewImages(previews);
        return r;
    }
}

