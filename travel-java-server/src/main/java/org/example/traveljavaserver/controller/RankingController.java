package org.example.traveljavaserver.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.traveljavaserver.entity.RankItem;
import org.example.traveljavaserver.mapper.RankItemMapper;
import org.example.traveljavaserver.vo.Result;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 榜单接口（公开，无需登录）
 * GET /api/ranks/cities            → 有数据的城市列表
 * GET /api/ranks?city=南昌         → { city, hotel:{red:[],black:[]}, food:..., spot:... }
 */
@RestController
@RequestMapping("/api/ranks")
public class RankingController {

    private final RankItemMapper rankItemMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RankingController(RankItemMapper rankItemMapper) {
        this.rankItemMapper = rankItemMapper;
    }

    @GetMapping("/cities")
    public Result<List<String>> cities() {
        List<RankItem> all = rankItemMapper.selectList(null);
        List<String> cities = all.stream().map(RankItem::getCity).distinct().collect(Collectors.toList());
        return Result.ok(cities);
    }

    @GetMapping
    public Result<Map<String, Object>> board(@RequestParam String city) {
        List<RankItem> items = rankItemMapper.selectList(
                new LambdaQueryWrapper<RankItem>().eq(RankItem::getCity, city));

        if (items.isEmpty()) {
            return Result.ok(null);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("city", city);

        for (String cat : Arrays.asList("hotel", "food", "spot")) {
            Map<String, Object> catData = new LinkedHashMap<>();
            for (String color : Arrays.asList("red", "black")) {
                List<Map<String, Object>> list = items.stream()
                        .filter(i -> cat.equals(i.getCat()) && color.equals(i.getColor()))
                        .sorted(Comparator.comparingInt(RankItem::getPosition))
                        .map(this::toSeed)
                        .collect(Collectors.toList());
                catData.put(color, list);
            }
            data.put(cat, catData);
        }
        return Result.ok(data);
    }

    /** 转前端种子格式：name/rating/priceText/tags/kw/loc/img/imgKw */
    private Map<String, Object> toSeed(RankItem it) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", it.getName());
        m.put("rating", it.getRating() == null ? 0 : it.getRating().doubleValue());
        m.put("priceText", it.getPriceText());
        m.put("tags", parseArray(it.getTags()));
        m.put("kw", parseArray(it.getKw()));
        m.put("loc", it.getLoc());
        m.put("img", it.getImg());
        m.put("imgKw", it.getImgKw());
        return m;
    }

    private List<String> parseArray(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
