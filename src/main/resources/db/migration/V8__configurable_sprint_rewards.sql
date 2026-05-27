-- Configurable quest/sprint completion rewards.
-- Rewards are now stored per sprint instead of being hard-coded for every sprint.

ALTER TABLE sprints
    ADD COLUMN reward_coins INT NOT NULL DEFAULT 0 AFTER status,
    ADD COLUMN reward_xp INT NOT NULL DEFAULT 0 AFTER reward_coins;

-- Existing Dragon quest from the demo/coursework scenario should keep its advertised 5000 coin reward.
-- Other sprints stay without a global completion reward unless the admin/Quest Master sets it explicitly.
UPDATE sprints
SET reward_coins = 5000
WHERE (LOWER(title) LIKE '%dragon%' OR LOWER(title) LIKE '%дракон%')
  AND reward_coins = 0;
