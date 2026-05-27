-- Reward reliability and admin project deletion support.
-- Backfills rewards that were left unclaimed when a sprint was marked COMPLETED through editing,
-- and task rewards for completed assigned missions with reward_claimed = 0.

CREATE TEMPORARY TABLE tmp_sprint_reward_backfill AS
SELECT
    sm.user_id AS user_id,
    SUM(COALESCE(s.reward_coins, 0)) AS coins_delta,
    SUM(COALESCE(s.reward_xp, 0)) AS xp_delta
FROM sprints s
JOIN sprint_members sm ON sm.sprint_id = s.id
WHERE s.status = 'COMPLETED'
  AND s.reward_claimed = 0
  AND (COALESCE(s.reward_coins, 0) > 0 OR COALESCE(s.reward_xp, 0) > 0)
GROUP BY sm.user_id;

UPDATE users u
JOIN tmp_sprint_reward_backfill r ON r.user_id = u.id
SET u.coins = u.coins + r.coins_delta,
    u.experience_points = u.experience_points + r.xp_delta,
    u.updated_at = NOW(6);

UPDATE sprints
SET reward_claimed = 1,
    updated_at = NOW(6)
WHERE status = 'COMPLETED'
  AND reward_claimed = 0
  AND (COALESCE(reward_coins, 0) > 0 OR COALESCE(reward_xp, 0) > 0);

DROP TEMPORARY TABLE tmp_sprint_reward_backfill;

CREATE TEMPORARY TABLE tmp_task_reward_backfill AS
SELECT
    assignee_id AS user_id,
    SUM(COALESCE(reward_coins, 0)) AS coins_delta,
    SUM(COALESCE(reward_xp, 0)) AS xp_delta
FROM tasks
WHERE status = 'DONE'
  AND reward_claimed = 0
  AND assignee_id IS NOT NULL
  AND (COALESCE(reward_coins, 0) > 0 OR COALESCE(reward_xp, 0) > 0)
GROUP BY assignee_id;

UPDATE users u
JOIN tmp_task_reward_backfill r ON r.user_id = u.id
SET u.coins = u.coins + r.coins_delta,
    u.experience_points = u.experience_points + r.xp_delta,
    u.updated_at = NOW(6);

UPDATE tasks
SET reward_claimed = 1,
    updated_at = NOW(6)
WHERE status = 'DONE'
  AND reward_claimed = 0
  AND assignee_id IS NOT NULL
  AND (COALESCE(reward_coins, 0) > 0 OR COALESCE(reward_xp, 0) > 0);

DROP TEMPORARY TABLE tmp_task_reward_backfill;

-- Recalculate levels for users that received backfilled XP.
-- Thresholds match app.gamification defaults: base 100, multiplier 1.5.
UPDATE users
SET level = CASE
    WHEN experience_points >= 443259 THEN 20
    WHEN experience_points >= 295438 THEN 19
    WHEN experience_points >= 196891 THEN 18
    WHEN experience_points >= 131193 THEN 17
    WHEN experience_points >= 87394 THEN 16
    WHEN experience_points >= 58195 THEN 15
    WHEN experience_points >= 38729 THEN 14
    WHEN experience_points >= 25752 THEN 13
    WHEN experience_points >= 17101 THEN 12
    WHEN experience_points >= 11334 THEN 11
    WHEN experience_points >= 7489 THEN 10
    WHEN experience_points >= 4926 THEN 9
    WHEN experience_points >= 3217 THEN 8
    WHEN experience_points >= 2078 THEN 7
    WHEN experience_points >= 1319 THEN 6
    WHEN experience_points >= 813 THEN 5
    WHEN experience_points >= 475 THEN 4
    WHEN experience_points >= 250 THEN 3
    WHEN experience_points >= 100 THEN 2
    ELSE 1
END;
