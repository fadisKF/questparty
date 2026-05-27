package com.questparty.repository;

import com.questparty.domain.entity.ShopItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShopItemRepository extends JpaRepository<ShopItem, Long> {

    List<ShopItem> findByActiveTrueOrderByNameAsc();

    List<ShopItem> findAllByOrderByNameAsc();
}
