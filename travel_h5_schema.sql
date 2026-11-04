-- ====================================================================
-- 智行旅行 Travel-H5 数据库建表脚本
-- MySQL 8.0+ / utf8mb4 / InnoDB
-- 执行前：CREATE DATABASE travel_h5 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ====================================================================

USE travel_h5;

-- -------------------- 1. 用户账号 --------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  username    VARCHAR(32)  NOT NULL                COMMENT '登录账号',
  password    VARCHAR(128) NOT NULL                COMMENT '密码（生产环境存 BCrypt）',
  role        VARCHAR(16)  NOT NULL DEFAULT 'user' COMMENT 'admin / user',
  name        VARCHAR(32)  NOT NULL                COMMENT '显示昵称',
  avatar      VARCHAR(16)  NOT NULL DEFAULT '✈️' COMMENT 'emoji 头像',
  sign        VARCHAR(100)          DEFAULT NULL   COMMENT '个性签名',
  origin      VARCHAR(32)           DEFAULT NULL   COMMENT '常住城市',
  budget      VARCHAR(32)           DEFAULT NULL   COMMENT '出行预算档位',
  interests   JSON                  DEFAULT NULL   COMMENT '兴趣偏好数组',
  status      TINYINT      NOT NULL DEFAULT 1      COMMENT '1=正常 0=禁用',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户账号';

-- 初始 2 个账号（密码明文，Spring Boot 接入前先用这个；后续改成 BCrypt 即可）
INSERT INTO users (username, password, role, name, avatar, sign, origin, budget, interests) VALUES
('admin',   'admin123',   'admin', '系统管理员', '🛡️', '管理全平台内容审核，确保社区健康运营', '北京', '10000+', JSON_ARRAY('历史人文','美食探店','住宿体验')),
('traveler','travel123', 'user',  '旅行体验官', '✈️', '把生活过成一场旅行，把旅行走成一段生活 ✈️', '南昌', '3000-5000', JSON_ARRAY('自然风光','美食探店','小众打卡'));


-- -------------------- 2. 行程规划 --------------------
DROP TABLE IF EXISTS trips;
CREATE TABLE trips (
  id            BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
  user_id       BIGINT        NOT NULL                COMMENT '所属用户',
  name          VARCHAR(80)   NOT NULL                COMMENT '行程名称',
  origin        VARCHAR(32)            DEFAULT NULL   COMMENT '出发地',
  destination   VARCHAR(80)   NOT NULL                COMMENT '目的地/目的地群',
  days          INT           NOT NULL DEFAULT 1      COMMENT '天数',
  people        INT           NOT NULL DEFAULT 1      COMMENT '出行人数',
  cost          DECIMAL(10,2) NOT NULL DEFAULT 0      COMMENT '预估/实际花费',
  status        VARCHAR(16)   NOT NULL DEFAULT '未出行' COMMENT '未出行/进行中/已完成/已取消',
  bg            VARCHAR(200)           DEFAULT NULL   COMMENT '卡片渐变色 CSS',
  summary       VARCHAR(255)           DEFAULT NULL   COMMENT '行程简介',
  tags          JSON                   DEFAULT NULL   COMMENT '标签数组',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_trips_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户行程';

DROP TABLE IF EXISTS trip_day_plans;
CREATE TABLE trip_day_plans (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  trip_id     BIGINT       NOT NULL,
  day_no      INT          NOT NULL COMMENT '第几天',
  day_title   VARCHAR(80)  NOT NULL COMMENT '当天主题',
  PRIMARY KEY (id),
  KEY idx_trip_id (trip_id),
  CONSTRAINT fk_dp_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行程每日计划';

DROP TABLE IF EXISTS trip_points;
CREATE TABLE trip_points (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  day_plan_id BIGINT       NOT NULL,
  name        VARCHAR(80)  NOT NULL,
  point_type  VARCHAR(16)           DEFAULT NULL COMMENT '景点/餐饮/购物/住宿',
  time_slot   VARCHAR(16)           DEFAULT NULL COMMENT '上午/下午/晚上',
  est_cost    DECIMAL(10,2)        DEFAULT 0,
  note        VARCHAR(255)          DEFAULT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_dp_id (day_plan_id),
  CONSTRAINT fk_pt_dp FOREIGN KEY (day_plan_id) REFERENCES trip_day_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行程点位';


-- -------------------- 3. 行李包 --------------------
DROP TABLE IF EXISTS packs;
CREATE TABLE packs (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  name        VARCHAR(80)  NOT NULL,
  note        VARCHAR(255)          DEFAULT NULL,
  saved_at    DATE         NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_packs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行李包';

DROP TABLE IF EXISTS pack_categories;
CREATE TABLE pack_categories (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  pack_id     BIGINT       NOT NULL,
  category_name VARCHAR(32) NOT NULL COMMENT '证件类/衣物类/电子设备类...',
  sort_order  INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_pack_id (pack_id),
  CONSTRAINT fk_pc_pack FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行李分类';

DROP TABLE IF EXISTS pack_items;
CREATE TABLE pack_items (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  category_id     BIGINT       NOT NULL,
  item_name       VARCHAR(64)  NOT NULL,
  quantity        INT          NOT NULL DEFAULT 1,
  checked_default TINYINT      NOT NULL DEFAULT 1 COMMENT '是否默认勾选',
  remark          VARCHAR(255)          DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_cat_id (category_id),
  CONSTRAINT fk_pi_cat FOREIGN KEY (category_id) REFERENCES pack_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行李物品';


-- -------------------- 4. 社区帖子 --------------------
DROP TABLE IF EXISTS community_posts;
CREATE TABLE community_posts (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  user_id     BIGINT        NOT NULL,
  author_name VARCHAR(32)   NOT NULL COMMENT '冗余昵称，审核历史快照',
  author_avatar VARCHAR(16)  NOT NULL DEFAULT '✈️',
  level       VARCHAR(16)   NOT NULL DEFAULT '旅行萌新',
  title       VARCHAR(100)  NOT NULL,
  content     TEXT          NOT NULL,
  city        VARCHAR(32)            DEFAULT NULL,
  cat         VARCHAR(32)   NOT NULL DEFAULT '行程攻略' COMMENT '美食探店/景点打卡/行程攻略/住宿体验/避雷避坑',
  tags        JSON                   DEFAULT NULL,
  images      JSON                   DEFAULT NULL COMMENT '图片 URL 数组',
  status      VARCHAR(16)   NOT NULL DEFAULT 'pending' COMMENT 'pending/approved/rejected',
  reject_reason VARCHAR(255)         DEFAULT NULL,
  likes       INT           NOT NULL DEFAULT 0,
  comments    INT           NOT NULL DEFAULT 0,
  views       INT           NOT NULL DEFAULT 0,
  liked_users JSON                   DEFAULT NULL COMMENT '点赞用户 id 集合（简单实现）',
  faved_users JSON                   DEFAULT NULL COMMENT '收藏用户 id 集合',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_status (status),
  KEY idx_cat (cat),
  KEY idx_city (city),
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区帖子';

DROP TABLE IF EXISTS post_comments;
CREATE TABLE post_comments (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  post_id     BIGINT       NOT NULL,
  user_id     BIGINT       NOT NULL,
  parent_id   BIGINT                DEFAULT NULL COMMENT '父评论 id，NULL=一级',
  reply_to    VARCHAR(32)           DEFAULT NULL COMMENT '回复对象昵称',
  content     VARCHAR(500) NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_post_id (post_id),
  CONSTRAINT fk_cmt_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子评论';


-- -------------------- 5. 账单与预算 --------------------
DROP TABLE IF EXISTS expense_plans;
CREATE TABLE expense_plans (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  user_id       BIGINT        NOT NULL,
  trip_id       BIGINT                 DEFAULT NULL,
  total_budget  DECIMAL(12,2) NOT NULL DEFAULT 0,
  title         VARCHAR(80)            DEFAULT NULL,
  ai_result     JSON                     DEFAULT NULL COMMENT 'AI 生成的预算建议/复盘结果',
  source        VARCHAR(16)             DEFAULT 'manual' COMMENT 'manual/ai',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_ep_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算方案';

DROP TABLE IF EXISTS expense_bills;
CREATE TABLE expense_bills (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  user_id     BIGINT        NOT NULL,
  trip_id     BIGINT                 DEFAULT NULL,
  plan_id     BIGINT                 DEFAULT NULL,
  source      VARCHAR(16)   NOT NULL DEFAULT 'manual' COMMENT 'manual/ai/import',
  category    VARCHAR(32)   NOT NULL DEFAULT '其他'  COMMENT '交通/住宿/餐饮/门票/购物/娱乐/其他',
  purpose     VARCHAR(100)           DEFAULT NULL,
  amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  actual      DECIMAL(10,2)          DEFAULT NULL COMMENT '实际花费（超支/结余）',
  day_no      INT                    DEFAULT NULL COMMENT '归属第几天',
  bill_date   DATE                   DEFAULT NULL,
  poi_id      VARCHAR(64)            DEFAULT NULL COMMENT '关联 POI',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_trip_id (trip_id),
  CONSTRAINT fk_bills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bills_plan FOREIGN KEY (plan_id) REFERENCES expense_plans(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账单明细';


-- -------------------- 6. 收藏（多态，一个主表 + 明细 JSON） --------------------
DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  fav_type    VARCHAR(16)  NOT NULL COMMENT 'route / food / spot / hotel / pack / post',
  target_id   VARCHAR(64)  NOT NULL COMMENT '被收藏对象的 id（帖子用 post_id，路线等用业务 id）',
  target_name VARCHAR(100)          DEFAULT NULL,
  cover_img   VARCHAR(500)          DEFAULT NULL,
  rating      DECIMAL(3,2)          DEFAULT NULL,
  price_text  VARCHAR(32)           DEFAULT NULL,
  tags        JSON                  DEFAULT NULL,
  keywords    JSON                  DEFAULT NULL,
  payload     JSON                  DEFAULT NULL COMMENT '完整业务对象快照',
  saved_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_type_target (user_id, fav_type, target_id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏（多态）';


-- -------------------- 7. 审核日志 --------------------
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  post_id     BIGINT       NOT NULL,
  admin_id    BIGINT       NOT NULL,
  action      VARCHAR(16)  NOT NULL COMMENT 'approve / reject',
  reason      VARCHAR(255)          DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_post_id (post_id),
  CONSTRAINT fk_al_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_al_admin FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子审核日志';


-- -------------------- 8. 榜单数据（可选，后期可从这里加载替换静态 rankData.js） --------------------
DROP TABLE IF EXISTS rank_items;
CREATE TABLE rank_items (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  rank_type   VARCHAR(16)  NOT NULL COMMENT 'hotel_black / hotel_red / food_black ...',
  position    INT          NOT NULL COMMENT '第几名',
  name        VARCHAR(100) NOT NULL,
  score       DECIMAL(5,2)          DEFAULT NULL,
  city        VARCHAR(32)           DEFAULT NULL,
  summary     VARCHAR(255)          DEFAULT NULL,
  tags        JSON                  DEFAULT NULL,
  cover_img   VARCHAR(500)          DEFAULT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_rank_type (rank_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='榜单条目';

-- -------------------- 9. AI 会话与场所缓存 --------------------
DROP TABLE IF EXISTS chat_sessions;
CREATE TABLE chat_sessions (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  session_key VARCHAR(64)  NOT NULL,
  title       VARCHAR(120)          DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_session (user_id, session_key),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 对话会话';

DROP TABLE IF EXISTS chat_messages;
CREATE TABLE chat_messages (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  session_id  BIGINT       NOT NULL,
  role        VARCHAR(16)  NOT NULL COMMENT 'user / assistant',
  content     TEXT         NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 对话消息';

DROP TABLE IF EXISTS poi_cache;
CREATE TABLE poi_cache (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  user_id       BIGINT                DEFAULT NULL,
  destination   VARCHAR(80)           DEFAULT NULL,
  route_context VARCHAR(500)          DEFAULT NULL,
  payload       JSON                  DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 沿途场所推荐缓存';


-- ====================================================================
-- 表关系速览：
--   users ──1:N──> trips ──1:N──> trip_day_plans ──1:N──> trip_points
--   users ──1:N──> packs ──1:N──> pack_categories ──1:N──> pack_items
--   users ──1:N──> community_posts ──1:N──> post_comments
--   users ──1:N──> expense_plans ──1:N──> expense_bills
--   users ──1:N──> favorites  (多态：type+target_id 唯一)
--   community_posts.status → pending/approved/rejected
-- ====================================================================
