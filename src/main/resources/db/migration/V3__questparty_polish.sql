-- Safety and polish for the gamified workflow.
-- Rewards must be claimed only once, even if a task is moved out of DONE and back again.

ALTER TABLE tasks
    ADD COLUMN reward_claimed TINYINT(1) NOT NULL DEFAULT 0 AFTER reward_xp;

UPDATE tasks
SET reward_claimed = 1
WHERE status = 'DONE';
