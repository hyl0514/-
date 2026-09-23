USE travel_h5;

INSERT INTO community_posts (user_id, author_name, author_avatar, level, title, content, city, cat, tags, images, status, likes, comments, views, created_at, updated_at) VALUES
(2, '旅行体验官', '✈️', '资深玩家', '南昌 4 天 3 夜深度攻略', '从滕王阁看落霞与孤鹜，到万寿宫逛夜景，再坐 2 小时车去武功山看日出。', '南昌', '行程攻略', '["攻略","历史人文"]', '[]', 'approved', 238, 47, 3280, NOW(), NOW()),
(2, '旅行体验官', '✈️', '旅行达人', '成都一周吃遍老字号', '连续 7 天吃了 14 家店，筛选出真正值得去的 8 家。', '成都', '美食探店', '["美食","老字号"]', '[]', 'approved', 512, 89, 5670, NOW(), NOW()),
(2, '旅行体验官', '✈️', '旅行萌新', '鼓浪屿一日游实拍', '刚从厦门回来，鼓浪屿真的很美。', '厦门', '景点打卡', '["景点"]', '[]', 'pending', 0, 0, 0, NOW(), NOW()),
(1, '系统管理员', '🛡️', '官方管理员', '平台规范公告', '欢迎来到智行旅行旅友空间，请遵守社区规范。', '全站', '行程攻略', '["公告"]', '[]', 'approved', 999, 100, 9999, NOW(), NOW());

INSERT INTO trips (user_id, name, origin, destination, days, people, cost, status, bg, summary, tags, created_at, updated_at) VALUES
(2, '成都经典三日游', '成都', '都江堰·熊猫基地', 3, 2, 2800, '已完成', 'linear-gradient(135deg, #2374DD, #4a90e8)', '宽窄巷子+锦里+熊猫基地', '["经典打卡","熊猫必看"]', NOW(), NOW()),
(2, '南昌本地深度游', '南昌市內', '滕王阁·武功山', 4, 3, 3600, '进行中', 'linear-gradient(135deg, #0EA5A4, #38bdbb)', '滕王阁+万寿宫+武功山', '["历史人文","自然风光"]', NOW(), NOW()),
(2, '寒假三亚度假', '出发', '三亚亚龙湾', 5, 4, 6800, '未出行', 'linear-gradient(135deg, #E8912F, #f2b15c)', '阳光沙滩慢节奏海岛度假', '["海岛度假"]', NOW(), NOW());

INSERT INTO packs (user_id, name, note, saved_at, created_at) VALUES
(2, '成都3日游穿搭包', '9月成都微凉，备薄外套', CURDATE(), NOW()),
(2, '夏日海边度假包', '三亚5天，防晒防水是重点', CURDATE(), NOW());

INSERT INTO expense_plans (user_id, total_budget, title, created_at) VALUES
(2, 5000, '9月出行预算', NOW());
