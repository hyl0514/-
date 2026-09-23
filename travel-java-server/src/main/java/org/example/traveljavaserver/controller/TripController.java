package org.example.traveljavaserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.example.traveljavaserver.auth.CurrentUser;
import org.example.traveljavaserver.auth.LoginUser;
import org.example.traveljavaserver.dto.TripCreateDTO;
import org.example.traveljavaserver.entity.Trip;
import org.example.traveljavaserver.entity.TripDayPlan;
import org.example.traveljavaserver.entity.TripPoint;
import org.example.traveljavaserver.mapper.TripDayPlanMapper;
import org.example.traveljavaserver.mapper.TripMapper;
import org.example.traveljavaserver.mapper.TripPointMapper;
import org.example.traveljavaserver.vo.Result;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 行程管理 —— 需 JWT
 */
@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripMapper tripMapper;
    private final TripDayPlanMapper dayPlanMapper;
    private final TripPointMapper pointMapper;

    public TripController(TripMapper tripMapper,
                          TripDayPlanMapper dayPlanMapper,
                          TripPointMapper pointMapper) {
        this.tripMapper = tripMapper;
        this.dayPlanMapper = dayPlanMapper;
        this.pointMapper = pointMapper;
    }

    @GetMapping
    public Result<List<Trip>> list(@CurrentUser LoginUser me) {
        List<Trip> trips = tripMapper.selectList(
                new LambdaQueryWrapper<Trip>()
                        .eq(Trip::getUserId, me.userId())
                        .orderByDesc(Trip::getCreatedAt)
        );
        for (Trip trip : trips) {
            fillNested(trip);
        }
        return Result.ok(trips);
    }

    @GetMapping("/{id}")
    public Result<Trip> detail(@CurrentUser LoginUser me, @PathVariable Long id) {
        Trip trip = tripMapper.selectOne(
                new LambdaQueryWrapper<Trip>().eq(Trip::getId, id).eq(Trip::getUserId, me.userId())
        );
        if (trip == null) return Result.fail(404, "行程不存在");
        fillNested(trip);
        return Result.ok(trip);
    }

    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public Result<Trip> create(@CurrentUser LoginUser me,
                               @RequestBody TripCreateDTO dto) {
        Trip trip = new Trip();
        trip.setUserId(me.userId());
        trip.setName(dto.getName());
        trip.setOrigin(dto.getOrigin());
        trip.setDestination(dto.getDestination());
        trip.setDays(dto.getDays());
        trip.setPeople(dto.getPeople());
        trip.setCost(dto.getCost());
        trip.setStatus(dto.getStatus() == null ? "planning" : dto.getStatus());
        trip.setBg(dto.getBg());
        trip.setSummary(dto.getSummary());
        trip.setTags(dto.getTags());
        trip.setCreatedAt(LocalDateTime.now());
        trip.setUpdatedAt(LocalDateTime.now());
        tripMapper.insert(trip);

        if (dto.getDayPlans() != null) {
            for (TripCreateDTO.DayPlan dp : dto.getDayPlans()) {
                TripDayPlan plan = new TripDayPlan();
                plan.setTripId(trip.getId());
                plan.setDayNo(dp.getDayNo());
                plan.setDayTitle(dp.getDayTitle());
                dayPlanMapper.insert(plan);

                if (dp.getPoints() != null) {
                    for (TripCreateDTO.Point pt : dp.getPoints()) {
                        TripPoint point = new TripPoint();
                        point.setDayPlanId(plan.getId());
                        point.setName(pt.getName());
                        point.setPointType(pt.getPointType());
                        point.setTimeSlot(pt.getTimeSlot());
                        point.setEstCost(pt.getEstCost());
                        point.setNote(pt.getNote());
                        point.setSortOrder(pt.getSortOrder());
                        pointMapper.insert(point);
                    }
                }
            }
        }

        fillNested(trip);
        return Result.ok(trip);
    }

    @PutMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public Result<Trip> update(@CurrentUser LoginUser me,
                               @PathVariable Long id,
                               @RequestBody TripCreateDTO dto) {
        Trip trip = tripMapper.selectOne(
                new LambdaQueryWrapper<Trip>().eq(Trip::getId, id).eq(Trip::getUserId, me.userId())
        );
        if (trip == null) return Result.fail(404, "行程不存在");

        trip.setName(dto.getName() != null ? dto.getName() : trip.getName());
        trip.setOrigin(dto.getOrigin() != null ? dto.getOrigin() : trip.getOrigin());
        trip.setDestination(dto.getDestination() != null ? dto.getDestination() : trip.getDestination());
        trip.setDays(dto.getDays() != null ? dto.getDays() : trip.getDays());
        trip.setPeople(dto.getPeople() != null ? dto.getPeople() : trip.getPeople());
        trip.setCost(dto.getCost() != null ? dto.getCost() : trip.getCost());
        trip.setStatus(dto.getStatus() != null ? dto.getStatus() : trip.getStatus());
        trip.setBg(dto.getBg() != null ? dto.getBg() : trip.getBg());
        trip.setSummary(dto.getSummary() != null ? dto.getSummary() : trip.getSummary());
        trip.setTags(dto.getTags() != null ? dto.getTags() : trip.getTags());
        trip.setUpdatedAt(LocalDateTime.now());
        tripMapper.updateById(trip);

        // 替换嵌套：先删旧的
        if (dto.getDayPlans() != null) {
            dayPlanMapper.delete(new LambdaQueryWrapper<TripDayPlan>().eq(TripDayPlan::getTripId, id));
            pointMapper.delete(new LambdaQueryWrapper<TripPoint>()
                    .in(TripPoint::getDayPlanId, new ArrayList<>())); // 下面再通过 dayPlan 关联

            for (TripCreateDTO.DayPlan dp : dto.getDayPlans()) {
                TripDayPlan plan = new TripDayPlan();
                plan.setTripId(trip.getId());
                plan.setDayNo(dp.getDayNo());
                plan.setDayTitle(dp.getDayTitle());
                dayPlanMapper.insert(plan);

                if (dp.getPoints() != null) {
                    for (TripCreateDTO.Point pt : dp.getPoints()) {
                        TripPoint point = new TripPoint();
                        point.setDayPlanId(plan.getId());
                        point.setName(pt.getName());
                        point.setPointType(pt.getPointType());
                        point.setTimeSlot(pt.getTimeSlot());
                        point.setEstCost(pt.getEstCost());
                        point.setNote(pt.getNote());
                        point.setSortOrder(pt.getSortOrder());
                        pointMapper.insert(point);
                    }
                }
            }
        }

        fillNested(trip);
        return Result.ok(trip);
    }

    @DeleteMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public Result<Object> delete(@CurrentUser LoginUser me, @PathVariable Long id) {
        Trip trip = tripMapper.selectOne(
                new LambdaQueryWrapper<Trip>().eq(Trip::getId, id).eq(Trip::getUserId, me.userId())
        );
        if (trip == null) return Result.fail(404, "行程不存在");

        // 级联删
        List<TripDayPlan> plans = dayPlanMapper.selectList(
                new LambdaQueryWrapper<TripDayPlan>().eq(TripDayPlan::getTripId, id)
        );
        for (TripDayPlan p : plans) {
            pointMapper.delete(new LambdaQueryWrapper<TripPoint>().eq(TripPoint::getDayPlanId, p.getId()));
        }
        dayPlanMapper.delete(new LambdaQueryWrapper<TripDayPlan>().eq(TripDayPlan::getTripId, id));
        tripMapper.deleteById(id);
        return Result.ok();
    }

    /** 内部：填充 dayPlans -> points */
    private void fillNested(Trip trip) {
        List<TripDayPlan> plans = dayPlanMapper.selectList(
                new LambdaQueryWrapper<TripDayPlan>()
                        .eq(TripDayPlan::getTripId, trip.getId())
                        .orderByAsc(TripDayPlan::getDayNo)
        );
        for (TripDayPlan plan : plans) {
            List<TripPoint> points = pointMapper.selectList(
                    new LambdaQueryWrapper<TripPoint>()
                            .eq(TripPoint::getDayPlanId, plan.getId())
                            .orderByAsc(TripPoint::getSortOrder)
            );
            plan.setPoints(points);
        }
        trip.setDayPlans(plans);
    }
}
