-- Rename reserved notification column `read` to read_flag.
-- The old column name caused MySQL/Hibernate SQL errors when creating notifications
-- during purchases, quest creation and adding party members.

SET @column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'notifications'
      AND COLUMN_NAME = 'read'
);

SET @sql := IF(
    @column_exists > 0,
    'ALTER TABLE notifications CHANGE COLUMN `read` read_flag TINYINT(1) NOT NULL DEFAULT 0',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
