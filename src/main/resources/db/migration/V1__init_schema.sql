-- QuestParty initial schema (MySQL 8)
-- Managed by Flyway; Hibernate ddl-auto=validate

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(120)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    display_name    VARCHAR(80)   NOT NULL,
    role            VARCHAR(30)   NOT NULL,
    level           INT           NOT NULL DEFAULT 1,
    experience_points BIGINT      NOT NULL DEFAULT 0,
    coins           BIGINT        NOT NULL DEFAULT 0,
    avatar_url      VARCHAR(500)  NULL,
    bio             VARCHAR(500)  NULL,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_users_email UNIQUE (email),
    INDEX idx_users_xp (experience_points DESC),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    description     TEXT          NULL,
    owner_id        BIGINT        NOT NULL,
    active          TINYINT(1)    NOT NULL DEFAULT 1,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_projects_owner (owner_id),
    INDEX idx_projects_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_members (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id      BIGINT        NOT NULL,
    user_id         BIGINT        NOT NULL,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_project_members UNIQUE (project_id, user_id),
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_pm_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sprints (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id      BIGINT        NOT NULL,
    title           VARCHAR(150)  NOT NULL,
    description     TEXT          NULL,
    start_date      DATE          NOT NULL,
    end_date        DATE          NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PLANNED',
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_sprints_project FOREIGN KEY (project_id) REFERENCES projects (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sprints_project (project_id),
    INDEX idx_sprints_status (status),
    INDEX idx_sprints_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sprint_members (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    sprint_id       BIGINT        NOT NULL,
    user_id         BIGINT        NOT NULL,
    party_role      VARCHAR(20)   NOT NULL DEFAULT 'MEMBER',
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_sprint_members UNIQUE (sprint_id, user_id),
    CONSTRAINT fk_sm_sprint FOREIGN KEY (sprint_id) REFERENCES sprints (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sm_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sm_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    sprint_id       BIGINT        NOT NULL,
    title           VARCHAR(200)  NOT NULL,
    description     TEXT          NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'BACKLOG',
    priority        VARCHAR(20)   NOT NULL DEFAULT 'MEDIUM',
    reward_coins    INT           NOT NULL DEFAULT 10,
    reward_xp       INT           NOT NULL DEFAULT 25,
    position        INT           NOT NULL DEFAULT 0,
    assignee_id     BIGINT        NULL,
    deadline        DATETIME(6)   NULL,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_tasks_sprint FOREIGN KEY (sprint_id) REFERENCES sprints (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_tasks_sprint_status_pos (sprint_id, status, position),
    INDEX idx_tasks_assignee (assignee_id),
    INDEX idx_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_comments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id         BIGINT        NOT NULL,
    author_id       BIGINT        NOT NULL,
    content         TEXT          NOT NULL,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_tc_task FOREIGN KEY (task_id) REFERENCES tasks (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tc_author FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_tc_task_created (task_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sprint_messages (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    sprint_id       BIGINT        NOT NULL,
    author_id       BIGINT        NOT NULL,
    content         TEXT          NOT NULL,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_sm_msg_sprint FOREIGN KEY (sprint_id) REFERENCES sprints (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sm_msg_author FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sprint_messages_sprint_created (sprint_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS achievements (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(40)   NOT NULL,
    title           VARCHAR(100)  NOT NULL,
    description     TEXT          NULL,
    icon_url        VARCHAR(500)  NULL,
    xp_bonus        INT           NOT NULL DEFAULT 0,
    coins_bonus     INT           NOT NULL DEFAULT 0,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_achievements_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_achievements (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    achievement_id  BIGINT        NOT NULL,
    unlocked_at     TIMESTAMP(6)  NOT NULL,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_user_achievements UNIQUE (user_id, achievement_id),
    CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ua_achievement FOREIGN KEY (achievement_id) REFERENCES achievements (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_ua_user_unlocked (user_id, unlocked_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shop_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    description     TEXT          NULL,
    price           BIGINT        NOT NULL,
    stock           INT           NOT NULL DEFAULT 0,
    image_url       VARCHAR(500)  NULL,
    category        VARCHAR(30)   NOT NULL,
    active          TINYINT(1)    NOT NULL DEFAULT 1,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_shop_items_active (active),
    INDEX idx_shop_items_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchases (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT        NOT NULL,
    shop_item_id    BIGINT        NOT NULL,
    quantity        INT           NOT NULL DEFAULT 1,
    total_price     BIGINT        NOT NULL,
    created_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_purchases_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_purchases_item FOREIGN KEY (shop_item_id) REFERENCES shop_items (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_purchases_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT        NOT NULL,
    type                VARCHAR(30)   NOT NULL,
    title               VARCHAR(200)  NOT NULL,
    message             TEXT          NOT NULL,
    `read`              TINYINT(1)    NOT NULL DEFAULT 0,
    related_entity_type VARCHAR(50)   NULL,
    related_entity_id   BIGINT        NULL,
    created_at          TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_notifications_user_read (user_id, `read`),
    INDEX idx_notifications_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
