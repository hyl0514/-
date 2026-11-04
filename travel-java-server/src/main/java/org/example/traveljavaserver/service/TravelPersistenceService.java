package org.example.traveljavaserver.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.traveljavaserver.dto.BudgetAdviceDTO;
import org.example.traveljavaserver.dto.PackingRequestDTO;
import org.example.traveljavaserver.dto.PoiRequestDTO;
import org.example.traveljavaserver.dto.RouteRequestDTO;
import org.example.traveljavaserver.entity.ChatMessage;
import org.example.traveljavaserver.entity.ChatSession;
import org.example.traveljavaserver.entity.ExpensePlan;
import org.example.traveljavaserver.entity.Pack;
import org.example.traveljavaserver.entity.PackCategory;
import org.example.traveljavaserver.entity.PackItem;
import org.example.traveljavaserver.entity.PoiCache;
import org.example.traveljavaserver.entity.Trip;
import org.example.traveljavaserver.entity.TripDayPlan;
import org.example.traveljavaserver.entity.TripPoint;
import org.example.traveljavaserver.mapper.ChatMessageMapper;
import org.example.traveljavaserver.mapper.ChatSessionMapper;
import org.example.traveljavaserver.mapper.ExpensePlanMapper;
import org.example.traveljavaserver.mapper.PackCategoryMapper;
import org.example.traveljavaserver.mapper.PackItemMapper;
import org.example.traveljavaserver.mapper.PackMapper;
import org.example.traveljavaserver.mapper.PoiCacheMapper;
import org.example.traveljavaserver.mapper.TripDayPlanMapper;
import org.example.traveljavaserver.mapper.TripMapper;
import org.example.traveljavaserver.mapper.TripPointMapper;
import org.example.traveljavaserver.vo.BudgetAdviceVO;
import org.example.traveljavaserver.vo.MultiRouteVO;
import org.example.traveljavaserver.vo.PackingListVO;
import org.example.traveljavaserver.vo.PoiRecommendVO;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * AI 生成结果持久化服务：路线、对话、场所推荐、预算建议、行李清单
 */
@Service
public class TravelPersistenceService {

    private final TripMapper tripMapper;
    private final TripDayPlanMapper dayPlanMapper;
    private final TripPointMapper pointMapper;
    private final ChatSessionMapper chatSessionMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final PoiCacheMapper poiCacheMapper;
    private final ExpensePlanMapper expensePlanMapper;
    private final PackMapper packMapper;
    private final PackCategoryMapper packCategoryMapper;
    private final PackItemMapper packItemMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TravelPersistenceService(TripMapper tripMapper,
                                    TripDayPlanMapper dayPlanMapper,
                                    TripPointMapper pointMapper,
                                    ChatSessionMapper chatSessionMapper,
                                    ChatMessageMapper chatMessageMapper,
                                    PoiCacheMapper poiCacheMapper,
                                    ExpensePlanMapper expensePlanMapper,
                                    PackMapper packMapper,
                                    PackCategoryMapper packCategoryMapper,
                                    PackItemMapper packItemMapper) {
        this.tripMapper = tripMapper;
        this.dayPlanMapper = dayPlanMapper;
        this.pointMapper = pointMapper;
        this.chatSessionMapper = chatSessionMapper;
        this.chatMessageMapper = chatMessageMapper;
        this.poiCacheMapper = poiCacheMapper;
        this.expensePlanMapper = expensePlanMapper;
        this.packMapper = packMapper;
        this.packCategoryMapper = packCategoryMapper;
        this.packItemMapper = packItemMapper;
    }

    /**
     * 把每套路线写入 trips -> trip_day_plans -> trip_points，并回填 option.tripId
     */
    @Transactional(rollbackFor = Exception.class)
    public void saveRoutePlans(Long userId, RouteRequestDTO req, MultiRouteVO vo) {
        if (vo == null || vo.getRouteList() == null) {
            return;
        }
        int optionIndex = 0;
        for (MultiRouteVO.RouteOption option : vo.getRouteList()) {
            optionIndex++;

            Trip trip = new Trip();
            trip.setUserId(userId);
            trip.setName(truncate(isBlank(option.getRouteName()) ? "AI路线方案" + optionIndex : option.getRouteName(), 80));
            trip.setOrigin(truncate(req.getOrigin(), 32));
            trip.setDestination(truncate(req.getDestination(), 80));
            trip.setDays(req.getTravelDays());
            trip.setPeople(1);
            trip.setCost(BigDecimal.valueOf(option.getEstimatedCost() == null ? 0 : option.getEstimatedCost()));
            trip.setStatus("未出行");
            trip.setSummary(truncate(option.getSummary(), 255));
            trip.setTags(toJsonArray(option.getTags()));
            trip.setCreatedAt(LocalDateTime.now());
            trip.setUpdatedAt(LocalDateTime.now());
            tripMapper.insert(trip);

            if (option.getDayPlans() != null) {
                int dayIndex = 0;
                for (MultiRouteVO.DayPlan dayPlan : option.getDayPlans()) {
                    dayIndex++;
                    TripDayPlan plan = new TripDayPlan();
                    plan.setTripId(trip.getId());
                    plan.setDayNo(dayPlan.getDayNo() == null ? dayIndex : dayPlan.getDayNo());
                    plan.setDayTitle(truncate(isBlank(dayPlan.getDayTitle())
                            ? "第" + dayIndex + "天" : dayPlan.getDayTitle(), 80));
                    dayPlanMapper.insert(plan);

                    if (dayPlan.getPoints() != null) {
                        int pointIndex = 0;
                        for (MultiRouteVO.RoutePoint routePoint : dayPlan.getPoints()) {
                            TripPoint point = new TripPoint();
                            point.setDayPlanId(plan.getId());
                            point.setName(truncate(isBlank(routePoint.getName())
                                    ? "自由活动" : routePoint.getName(), 80));
                            point.setPointType(truncate(routePoint.getPointType(), 16));
                            point.setTimeSlot(truncate(routePoint.getTimeSlot(), 16));
                            point.setEstCost(BigDecimal.valueOf(routePoint.getEstCost() == null ? 0 : routePoint.getEstCost()));
                            point.setNote(truncate(routePoint.getNote(), 255));
                            point.setSortOrder(pointIndex++);
                            pointMapper.insert(point);
                        }
                    }
                }
            }

            option.setTripId(trip.getId());
        }
    }

    /**
     * 获取或创建会话：同 user + session_key 复用，唯一键冲突时回查
     */
    @Transactional(rollbackFor = Exception.class)
    public Long ensureChatSession(Long userId, String sessionKey, String title) {
        ChatSession exist = chatSessionMapper.selectOne(new LambdaQueryWrapper<ChatSession>()
                .eq(ChatSession::getUserId, userId)
                .eq(ChatSession::getSessionKey, sessionKey));
        if (exist != null) {
            return exist.getId();
        }
        try {
            ChatSession session = new ChatSession();
            session.setUserId(userId);
            session.setSessionKey(sessionKey);
            session.setTitle(truncate(title, 120));
            session.setCreatedAt(LocalDateTime.now());
            chatSessionMapper.insert(session);
            return session.getId();
        } catch (DuplicateKeyException e) {
            ChatSession again = chatSessionMapper.selectOne(new LambdaQueryWrapper<ChatSession>()
                    .eq(ChatSession::getUserId, userId)
                    .eq(ChatSession::getSessionKey, sessionKey));
            return again == null ? null : again.getId();
        }
    }

    /**
     * 保存一条对话消息
     */
    @Transactional(rollbackFor = Exception.class)
    public void saveChatMessage(Long sessionId, String role, String content) {
        if (sessionId == null || isBlank(content)) {
            return;
        }
        ChatMessage message = new ChatMessage();
        message.setSessionId(sessionId);
        message.setRole(role);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        chatMessageMapper.insert(message);
    }

    /**
     * 保存沿途场所推荐结果，返回缓存记录 id
     */
    @Transactional(rollbackFor = Exception.class)
    public Long savePoi(Long userId, PoiRequestDTO req, PoiRecommendVO vo) {
        PoiCache cache = new PoiCache();
        cache.setUserId(userId);
        cache.setDestination(truncate(req.getDestination(), 80));
        cache.setRouteContext(truncate(req.getRouteContext(), 500));
        cache.setPayload(toJson(vo));
        cache.setCreatedAt(LocalDateTime.now());
        poiCacheMapper.insert(cache);
        return cache.getId();
    }

    /**
     * 保存 AI 预算建议 / 消费复盘，返回方案 id
     */
    @Transactional(rollbackFor = Exception.class)
    public Long saveBudgetAdvice(Long userId, BudgetAdviceDTO req, BudgetAdviceVO vo) {
        ExpensePlan plan = new ExpensePlan();
        plan.setUserId(userId);
        plan.setTotalBudget(BigDecimal.valueOf(req.getTotalBudget() == null ? 0 : req.getTotalBudget()));
        String destination = isBlank(req.getDestination()) ? "" : "-" + req.getDestination().trim();
        plan.setTitle(truncate("AI预算建议" + destination, 80));
        plan.setAiResult(toJson(vo));
        plan.setSource("ai");
        plan.setCreatedAt(LocalDateTime.now());
        expensePlanMapper.insert(plan);
        return plan.getId();
    }

    /**
     * 保存 AI 打包清单到 packs -> pack_categories -> pack_items，返回行李包 id
     */
    @Transactional(rollbackFor = Exception.class)
    public Long savePackingList(Long userId, PackingRequestDTO req, PackingListVO vo) {
        Pack pack = new Pack();
        pack.setUserId(userId);
        pack.setName(truncate("AI打包清单-" + req.getDestination(), 80));
        String tripType = isBlank(req.getTripType()) ? "旅游" : req.getTripType().trim();
        pack.setNote(truncate(tripType + " · " + req.getTravelDays() + "天", 255));
        pack.setSavedAt(LocalDateTime.now());
        pack.setCreatedAt(LocalDateTime.now());
        packMapper.insert(pack);

        if (vo.getCategoryList() != null) {
            int categoryIndex = 0;
            for (PackingListVO.Category category : vo.getCategoryList()) {
                PackCategory cat = new PackCategory();
                cat.setPackId(pack.getId());
                cat.setCategoryName(truncate(isBlank(category.getCategoryName())
                        ? "其他" : category.getCategoryName(), 32));
                cat.setSortOrder(categoryIndex++);
                packCategoryMapper.insert(cat);

                List<PackingListVO.Item> items = category.getItemList();
                if (items != null) {
                    for (PackingListVO.Item itemVO : items) {
                        PackItem item = new PackItem();
                        item.setCategoryId(cat.getId());
                        item.setItemName(truncate(isBlank(itemVO.getItemName())
                                ? "未命名物品" : itemVO.getItemName(), 64));
                        item.setQuantity(itemVO.getQuantity() == null ? 1 : itemVO.getQuantity());
                        item.setCheckedDefault(itemVO.getCheckedDefault() == null
                                ? 1 : (itemVO.getCheckedDefault() ? 1 : 0));
                        item.setRemark(truncate(itemVO.getRemark(), 255));
                        packItemMapper.insert(item);
                    }
                }
            }
        }
        return pack.getId();
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalStateException("JSON序列化失败: " + e.getMessage());
        }
    }

    private String toJsonArray(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return toJson(values);
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
