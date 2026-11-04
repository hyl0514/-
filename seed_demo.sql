USE travel_h5;

DELETE FROM community_posts WHERE id >= 9;

INSERT INTO community_posts (user_id, author_name, author_avatar, level, title, content, city, cat, status, likes, comments, views, tags, images) VALUES
(2, '旅行体验官', '✈️', '资深旅友', '南昌 4 天 3 夜深度攻略｜美食+文化+夜景一网打尽', '作为本地人整理的最良心南昌攻略！第一天必去八一起义纪念馆（周一闭馆注意时间），然后滕王阁登楼看赣江，晚上去绳金塔夜市吃拌粉和瓦罐汤。第二天万寿宫历史文化街区慢慢逛，中午老三样（船山路店）必点酒糟肉和藜蒿炒腊肉，下午去南昌之星摩天轮转一圈俯瞰全城。第三天可以去梅岭爬山或者江西博物馆看海昏侯展。费用人均每天 300 左右，住宿推荐红谷滩新区。', '南昌', '行程攻略', 'approved', 128, 32, 1542', '["南昌","美食","滕王阁","攻略"]', '[]'),
(2, '旅行体验官', '🍜', '美食侦探', '成都一周吃遍老字号｜本地人带你避雷', '别再网红店排队了！以下是成都本地人每周必吃：陈麻婆豆腐（青华路店）- 正宗麻辣鲜香；钟水饺（人民公园店）- 红油抄手加鸡汤绝了；龙抄手（春熙路总店）- 皮薄馅大；赖汤圆（总府路店）- 甜而不腻；夫妻肺片（红星路店）- 老成都味道；廖记棒棒鸡 - 冷串串鼻祖。住宿推荐春熙路或宽窄巷子附近，地铁 2 号线沿线最方便。', '成都', '美食探店', 'approved', 256, 58, 2310', '["成都","美食","老字号","避坑"]', '[]'),
(2, '旅行体验官', '🏖️', '摄影达人', '鼓浪屿一日游实拍｜避开人潮的小众路线', '早上 7 点出发坐第一班渡轮（人最少！），先去菽庄花园看钢琴博物馆，然后港仔后海滨浴场拍逆光照片最美。中午龙头路吃沙茶面（推荐林记！），下午走港后路到燕尾山看海，最后去音乐厅听一场免费演奏。岛上不能骑车只能步行，穿舒服的鞋子！鼓浪屿船票要提前在厦门轮渡码头公众号买。', '厦门', '景点打卡', 'approved', 89, 15, 987', '["厦门","鼓浪屿","摄影","小众"]', '[]'),
(2, '旅行体验官', '🏔️', '徒步爱好者', '武功山两日徒步｜云海日出完整攻略', 'Day1：上午从萍乡坐景区大巴到龙山村，从龙山村上山（2 小时到发云界），下午走发云界 - 绝望坡 - 金顶，日落前到金顶租帐篷。Day2：凌晨 5 点起来看日出（云海概率很高！），然后从金顶 - 紫家冲下山。全程约 22 公里，难度中等，带够水和零食，山上租帐篷 80 元/人。装备建议：冲锋衣、登山杖、头灯、充电宝。', '萍乡', '户外徒步', 'approved', 203, 42, 1876', '["武功山","徒步","日出","户外"]', '[]');

DELETE FROM expense_bills;
DELETE FROM expense_plans WHERE id > 2;

INSERT INTO expense_plans (user_id, title, total_budget, source, created_at) VALUES
(2, '南昌 3 天美食之旅预算', 3000.00, 'manual', NOW());

SET @plan_id = LAST_INSERT_ID();

INSERT INTO expense_bills (plan_id, category, amount, note, created_at) VALUES
(@plan_id, '住宿', 800.00, '万达嘉华酒店 2 晚', '2026-11-01'),
(@plan_id, '餐饮', 600.00, '老三样+黄记煌+绳金塔夜市', '2026-11-01'),
(@plan_id, '交通', 400.00, '高铁往返+当地打车', '2026-11-01'),
(@plan_id, '门票', 200.00, '滕王阁+南昌之星摩天轮', '2026-11-02'),
(@plan_id, '购物', 300.00, '伴手礼+当地特产', '2026-11-03'),
(@plan_id, '其他', 150.00, '咖啡奶茶+应急支出', '2026-11-03');

DELETE FROM pack_items;
DELETE FROM pack_categories;
DELETE FROM packs;

INSERT INTO packs (user_id, name, note, created_at) VALUES
(2, '南昌 3 天秋季行李', 'AI 生成清单', NOW());

SET @pack_id = LAST_INSERT_ID();

INSERT INTO pack_categories (pack_id, category_name, sort_order) VALUES
(@pack_id, '证件与电子', 1),
(@pack_id, '衣物穿着', 2),
(@pack_id, '洗漱用品', 3),
(@pack_id, '药品应急', 4);

INSERT INTO pack_items (category_id, item_name, quantity, checked_default, remark)
SELECT c.id, t.name, t.qty, t.chk, t.remark
FROM pack_categories c
JOIN (
  SELECT '身份证/驾驶证' name, 1 qty, 1 chk, '住店必须' remark UNION ALL
  SELECT '手机+充电器+充电宝', 1, 1, '双口充电宝 20000mAh 够用' UNION ALL
  SELECT '相机+备用电池', 1, 0, '拍滕王阁和摩天轮夜景'
) t ON c.category_name = '证件与电子'
WHERE c.pack_id = @pack_id;

INSERT INTO pack_items (category_id, item_name, quantity, checked_default, remark)
SELECT c.id, t.name, t.qty, t.chk, t.remark
FROM pack_categories c
JOIN (
  SELECT '秋季外套/风衣', 1 qty, 1 chk, '南昌 11-15°C 左右' remark UNION ALL
  SELECT '短袖衬衫', 2, 1, '白天热' UNION ALL
  SELECT '长裤/牛仔裤', 2, 1, '徒步方便' UNION ALL
  SELECT '运动鞋/休闲鞋', 1, 1, '鼓浪屿+武功山必穿' UNION ALL
  SELECT '遮阳帽+太阳镜', 1, 0, '秋季阳光仍强'
) t ON c.category_name = '衣物穿着'
WHERE c.pack_id = @pack_id;

INSERT INTO pack_items (category_id, item_name, quantity, checked_default, remark)
SELECT c.id, t.name, t.qty, t.chk, t.remark
FROM pack_categories c
JOIN (
  SELECT '牙刷+牙膏+洗漱杯', 1 qty, 1 chk, '分装更省空间' remark UNION ALL
  SELECT '洗面奶+面霜', 1, 1, '秋季补水' UNION ALL
  SELECT '毛巾+浴巾', 1, 0, '酒店虽有但自带干净'
) t ON c.category_name = '洗漱用品'
WHERE c.pack_id = @pack_id;

INSERT INTO pack_items (category_id, item_name, quantity, checked_default, remark)
SELECT c.id, t.name, t.qty, t.chk, t.remark
FROM pack_categories c
JOIN (
  SELECT '肠胃药/消食片', 1 qty, 1 chk, '南昌美食多别吃坏了' remark UNION ALL
  SELECT '创可贴+碘伏', 1, 0, '磨脚或小擦伤' UNION ALL
  SELECT '晕车药', 1, 0, '景区大巴备点'
) t ON c.category_name = '药品应急'
WHERE c.pack_id = @pack_id;
