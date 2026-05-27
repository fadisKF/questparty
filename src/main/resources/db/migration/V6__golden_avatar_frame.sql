-- Profile customization: activated golden avatar frame.

SET @column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'golden_avatar_frame_active'
);

SET @sql := IF(
    @column_exists = 0,
    'ALTER TABLE users ADD COLUMN golden_avatar_frame_active TINYINT(1) NOT NULL DEFAULT 0 AFTER bio',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
