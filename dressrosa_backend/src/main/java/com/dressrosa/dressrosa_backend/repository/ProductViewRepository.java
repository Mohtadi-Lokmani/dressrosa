package com.dressrosa.dressrosa_backend.repository;

import com.dressrosa.dressrosa_backend.model.Product;
import com.dressrosa.dressrosa_backend.model.ProductView;
import com.dressrosa.dressrosa_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductViewRepository extends JpaRepository<ProductView, Long> {

    long countByProduct(Product product);

    @Query("SELECT COUNT(pv) FROM ProductView pv WHERE pv.product.seller.userId = :sellerId AND pv.viewedAt >= :since")
    long countBySellerIdAndRecent(@Param("sellerId") Long sellerId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(pv) FROM ProductView pv WHERE pv.product.seller.userId = :sellerId")
    long countBySellerId(@Param("sellerId") Long sellerId);

    // For aggregate charts: count views per day
    @Query("SELECT CAST(pv.viewedAt AS date) as viewDate, COUNT(pv) as viewCount " +
           "FROM ProductView pv " +
           "WHERE pv.product.seller.userId = :sellerId AND pv.viewedAt >= :since " +
           "GROUP BY CAST(pv.viewedAt AS date) " +
           "ORDER BY viewDate ASC")
    List<Object[]> findDailyViewsForSeller(@Param("sellerId") Long sellerId, @Param("since") LocalDateTime since);
}
