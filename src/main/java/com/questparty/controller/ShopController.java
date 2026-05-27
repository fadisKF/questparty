package com.questparty.controller;

import com.questparty.dto.request.CreateShopItemRequest;
import com.questparty.dto.request.PurchaseFulfillmentRequest;
import com.questparty.dto.request.PurchaseRequest;
import com.questparty.dto.request.UpdateShopItemRequest;
import com.questparty.dto.response.PurchaseResponse;
import com.questparty.dto.response.ShopItemResponse;
import com.questparty.service.ShopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shop")
@RequiredArgsConstructor
@Tag(name = "Shop")
public class ShopController {

    private final ShopService shopService;

    @GetMapping("/items")
    public List<ShopItemResponse> list() {
        return shopService.listItems();
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ShopItemResponse create(@Valid @RequestBody CreateShopItemRequest request) {
        return shopService.createItem(request);
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update shop item; admin only")
    public ShopItemResponse update(@PathVariable Long itemId,
                                   @Valid @RequestBody UpdateShopItemRequest request) {
        return shopService.updateItem(itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove shop item from active catalog; admin only")
    public void delete(@PathVariable Long itemId) {
        shopService.deleteItem(itemId);
    }

    @PostMapping("/purchase")
    public ShopItemResponse purchase(@Valid @RequestBody PurchaseRequest request) {
        return shopService.purchase(request);
    }

    @GetMapping("/inventory")
    @Operation(summary = "Current user's inventory")
    public List<PurchaseResponse> inventory() {
        return shopService.listInventory();
    }

    @GetMapping("/inventory/users/{userId}")
    @Operation(summary = "Inventory for user; self or admin only")
    public List<PurchaseResponse> inventoryForUser(@PathVariable Long userId) {
        return shopService.listInventoryForUser(userId);
    }

    @PatchMapping("/inventory/{purchaseId}/fulfillment")
    @Operation(summary = "Choose pickup or delivery for a purchased item")
    public PurchaseResponse updateFulfillment(@PathVariable Long purchaseId,
                                              @Valid @RequestBody PurchaseFulfillmentRequest request) {
        return shopService.updateFulfillment(purchaseId, request);
    }

    @PatchMapping("/inventory/{purchaseId}/activate-time-off")
    @Operation(summary = "Activate purchased time off")
    public PurchaseResponse activateTimeOff(@PathVariable Long purchaseId) {
        return shopService.activateTimeOff(purchaseId);
    }

    @PatchMapping("/inventory/{purchaseId}/activate-profile-frame")
    @Operation(summary = "Activate purchased golden avatar frame")
    public PurchaseResponse activateProfileFrame(@PathVariable Long purchaseId) {
        return shopService.activateProfileFrame(purchaseId);
    }
}
