package com.dressrosa.dressrosa_backend.controller;

import com.dressrosa.dressrosa_backend.dto.collection.CollectionCreateRequest;
import com.dressrosa.dressrosa_backend.dto.collection.CollectionResponse;
import com.dressrosa.dressrosa_backend.dto.user.UserDTO;
import com.dressrosa.dressrosa_backend.service.CollectionService;
import com.dressrosa.dressrosa_backend.service.UserService;
import com.dressrosa.dressrosa_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collections")
@CrossOrigin(origins = "*")
public class CollectionController {

    @Autowired
    private CollectionService collectionService;

    @Autowired
    private UserService userService;

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<CollectionResponse>> getSellerCollections(@PathVariable Long sellerId) {
        return ResponseEntity.ok(collectionService.getSellerCollections(sellerId));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<CollectionResponse> create(@Valid @RequestBody CollectionCreateRequest request) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        CollectionResponse created = collectionService.createCollection(currentUser.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{collectionId}/items")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<Long>> getCollectionItems(@PathVariable Long collectionId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        return ResponseEntity.ok(collectionService.getCollectionProductIds(collectionId, currentUser.getUserId()));
    }

    @PostMapping("/{collectionId}/items")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> addItem(@PathVariable Long collectionId, @RequestBody Map<String, Long> body) {
        Long productId = body.get("productId");
        if (productId == null) return ResponseEntity.badRequest().body(Map.of("message", "productId is required"));
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        collectionService.addProductToCollection(collectionId, productId, currentUser.getUserId());
        return ResponseEntity.ok(Map.of("message", "Added"));
    }

    @DeleteMapping("/{collectionId}/items/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> removeItem(@PathVariable Long collectionId, @PathVariable Long productId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        collectionService.removeProductFromCollection(collectionId, productId, currentUser.getUserId());
        return ResponseEntity.ok(Map.of("message", "Removed"));
    }

    @DeleteMapping("/{collectionId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> delete(@PathVariable Long collectionId) {
        String email = SecurityUtil.getCurrentUserEmail();
        UserDTO currentUser = userService.getCurrentUser(email);
        collectionService.deleteCollection(collectionId, currentUser.getUserId());
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}

