-- QuestParty demo / test data
-- Passwords: admin123, manager123, employee123 (BCrypt)

INSERT INTO users (id, email, password_hash, display_name, role, level, experience_points, coins, created_at, updated_at)
VALUES
    (1, 'admin@questparty.local', '$2a$10$SGYyrZDJVh8x9ALo1iRZue4jZzyM7Y9SoGUlOrL1BZVe/dWLE1qEu', 'System Admin', 'ADMIN', 5, 1200, 1500, NOW(6), NOW(6)),
    (2, 'manager@questparty.local', '$2a$10$qXMyBWmFYyn37W4z9mFH/.iakEph/rCFX4GR3zCWeTeFJ1jNK/zRe', 'Quest Master', 'PROJECT_MANAGER', 4, 800, 600, NOW(6), NOW(6)),
    (3, 'hero@questparty.local', '$2a$10$6JKnHbt3ugE9ZYIvZwECQOtQ3IOMc6FfJgiCn52IqpJ30txJTKnuO', 'Party Hero', 'EMPLOYEE', 3, 450, 320, NOW(6), NOW(6)),
    (4, 'scout@questparty.local', '$2a$10$6JKnHbt3ugE9ZYIvZwECQOtQ3IOMc6FfJgiCn52IqpJ30txJTKnuO', 'Quest Scout', 'EMPLOYEE', 2, 180, 150, NOW(6), NOW(6));

INSERT INTO projects (id, name, description, owner_id, active, created_at, updated_at)
VALUES
    (1, 'Dragon Release', 'Main product quest line for Q2', 2, 1, NOW(6), NOW(6)),
    (2, 'Guild Onboarding', 'Internal HR gamification pilot', 1, 1, NOW(6), NOW(6));

INSERT INTO project_members (project_id, user_id, created_at, updated_at)
VALUES
    (1, 2, NOW(6), NOW(6)),
    (1, 3, NOW(6), NOW(6)),
    (1, 4, NOW(6), NOW(6)),
    (2, 1, NOW(6), NOW(6)),
    (2, 3, NOW(6), NOW(6));

INSERT INTO sprints (id, project_id, title, description, start_date, end_date, status, created_at, updated_at)
VALUES
    (1, 1, 'Quest: Castle Gate', 'First sprint — authentication & core API', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'ACTIVE', NOW(6), NOW(6)),
    (2, 1, 'Quest: Dragon Lair', 'Kanban, shop, realtime chat', DATE_ADD(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 28 DAY), 'PLANNED', NOW(6), NOW(6)),
    (3, 2, 'Quest: New Recruits', 'Onboarding missions', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'ACTIVE', NOW(6), NOW(6));

INSERT INTO sprint_members (sprint_id, user_id, party_role, created_at, updated_at)
VALUES
    (1, 2, 'LEADER', NOW(6), NOW(6)),
    (1, 3, 'MEMBER', NOW(6), NOW(6)),
    (1, 4, 'MEMBER', NOW(6), NOW(6)),
    (2, 2, 'LEADER', NOW(6), NOW(6)),
    (3, 1, 'LEADER', NOW(6), NOW(6)),
    (3, 3, 'MEMBER', NOW(6), NOW(6));

INSERT INTO tasks (sprint_id, title, description, status, priority, reward_coins, reward_xp, position, assignee_id, created_at, updated_at)
VALUES
    (1, 'Setup MySQL + Flyway', 'Database migrations and seed', 'DONE', 'HIGH', 30, 50, 0, 3, NOW(6), NOW(6)),
    (1, 'JWT Security hardening', 'Validate tokens and roles', 'IN_PROGRESS', 'HIGH', 25, 40, 0, 3, NOW(6), NOW(6)),
    (1, 'Kanban move API', 'PATCH /tasks/{id}/move', 'TODO', 'MEDIUM', 20, 35, 0, 4, NOW(6), NOW(6)),
    (1, 'WebSocket chat', 'STOMP sprint chat', 'BACKLOG', 'MEDIUM', 15, 30, 0, 4, NOW(6), NOW(6)),
    (1, 'Achievement engine', 'Unlock on task complete', 'REVIEW', 'LOW', 10, 20, 0, 3, NOW(6), NOW(6)),
    (3, 'Welcome tour mission', 'Complete profile setup', 'IN_PROGRESS', 'LOW', 10, 25, 0, 3, NOW(6), NOW(6));

INSERT INTO achievements (code, title, description, xp_bonus, coins_bonus, created_at, updated_at)
VALUES
    ('FIRST_TASK', 'First Task', 'Complete your first mission', 50, 10, NOW(6), NOW(6)),
    ('COINS_100', '100 Coins', 'Accumulate 100 coins', 25, 0, NOW(6), NOW(6)),
    ('COINS_500', '500 Coins', 'Accumulate 500 coins', 50, 0, NOW(6), NOW(6)),
    ('SPRINT_HERO', 'Sprint Hero', 'Complete all tasks in an active quest', 100, 50, NOW(6), NOW(6)),
    ('LEVEL_5', 'Level 5', 'Reach level 5', 100, 20, NOW(6), NOW(6)),
    ('LEVEL_10', 'Level 10', 'Reach level 10', 200, 50, NOW(6), NOW(6)),
    ('TASKS_10', '10 Tasks Done', 'Complete 10 missions', 75, 25, NOW(6), NOW(6)),
    ('TASKS_50', '50 Tasks Done', 'Complete 50 missions', 150, 75, NOW(6), NOW(6)),
    ('SHOP_FIRST_PURCHASE', 'First Purchase', 'Buy something from the shop', 25, 20, NOW(6), NOW(6));

INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, created_at, updated_at)
SELECT 3, id, NOW(6), NOW(6), NOW(6) FROM achievements WHERE code = 'FIRST_TASK';

INSERT INTO shop_items (name, description, price, stock, category, active, created_at, updated_at)
VALUES
    ('QuestParty Hoodie', 'Company merch', 500, 20, 'MERCH', 1, NOW(6), NOW(6)),
    ('Bonus Vacation (+4h)', 'Extra time off', 800, 10, 'VACATION_HOURS', 1, NOW(6), NOW(6)),
    ('Golden Avatar Frame', 'Profile customization', 200, 100, 'PROFILE_CUSTOMIZATION', 1, NOW(6), NOW(6)),
    ('Sprint Hero Badge', 'Exclusive badge', 300, 50, 'BADGE', 1, NOW(6), NOW(6));

INSERT INTO sprint_messages (sprint_id, author_id, content, created_at, updated_at)
VALUES
    (1, 2, 'Party assembled! Let''s clear this quest.', NOW(6), NOW(6)),
    (1, 3, 'Moving JWT task to IN_PROGRESS.', NOW(6), NOW(6));

INSERT INTO notifications (user_id, type, title, message, `read`, related_entity_type, related_entity_id, created_at, updated_at)
VALUES
    (3, 'TASK_ASSIGNED', 'New mission', 'JWT Security hardening', 0, 'TASK', 2, NOW(6), NOW(6)),
    (3, 'ACHIEVEMENT_UNLOCKED', 'Achievement unlocked', 'First Task', 0, 'ACHIEVEMENT', 1, NOW(6), NOW(6));
