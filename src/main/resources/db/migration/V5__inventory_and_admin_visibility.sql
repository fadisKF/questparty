-- Inventory details for purchased rewards and admin visibility fixes.

ALTER TABLE purchases
    ADD COLUMN fulfillment_method VARCHAR(30) NOT NULL DEFAULT 'NOT_SELECTED' AFTER total_price,
    ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'OWNED' AFTER fulfillment_method,
    ADD COLUMN fulfillment_comment VARCHAR(500) NULL AFTER status,
    ADD COLUMN activated_at TIMESTAMP(6) NULL AFTER fulfillment_comment;
