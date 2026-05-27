-- Fix golden frame activation enum length, add one-time sprint completion rewards.
-- Quest completion reward: every party member gets 5000 company coins and 500 XP once.

ALTER TABLE purchases
    MODIFY COLUMN fulfillment_method VARCHAR(50) NOT NULL DEFAULT 'NOT_SELECTED',
    MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'OWNED';

ALTER TABLE sprints
    ADD COLUMN reward_claimed TINYINT(1) NOT NULL DEFAULT 0 AFTER status;

UPDATE sprints
SET reward_claimed = 1
WHERE status = 'COMPLETED';
